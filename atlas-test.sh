# =============================================================================
# ATLAS Manual Integration Test Helpers
#
# Usage:
#   source ./atlas-test.sh
#
# Backend:  http://localhost:3000
# Frontend: http://localhost:3001
# =============================================================================

export ATLAS_BACKEND_URL="${ATLAS_BACKEND_URL:-http://localhost:3000}"
export ATLAS_FRONTEND_URL="${ATLAS_FRONTEND_URL:-http://localhost:3001}"

export ATLAS_TEST_PASSWORD="${ATLAS_TEST_PASSWORD:-16102003}"

export ATLAS_ADMIN_EMAIL="${ATLAS_ADMIN_EMAIL:-admin@atlas.com}"
export ATLAS_INSTRUCTOR_EMAIL="${ATLAS_INSTRUCTOR_EMAIL:-instructor@atlas.com}"
export ATLAS_STUDENT_EMAIL="${ATLAS_STUDENT_EMAIL:-student@atlas.com}"

export ATLAS_ADMIN_COOKIES="${ATLAS_ADMIN_COOKIES:-/tmp/atlas-admin-cookies.txt}"
export ATLAS_INSTRUCTOR_COOKIES="${ATLAS_INSTRUCTOR_COOKIES:-/tmp/atlas-instructor-cookies.txt}"
export ATLAS_STUDENT_COOKIES="${ATLAS_STUDENT_COOKIES:-/tmp/atlas-student-cookies.txt}"


# -----------------------------------------------------------------------------
# Internal login helper
#
# IMPORTANT:
# Login goes through the frontend BFF because the browser-facing frontend owns
# the authentication cookies used by our manual frontend integration tests.
# -----------------------------------------------------------------------------

_atlas_login() {
  local role="$1"
  local email="$2"
  local cookie_file="$3"

  rm -f "$cookie_file"

  echo "Logging in as $role ($email)..."

  local response
  response="$(
    curl -sS \
      -c "$cookie_file" \
      -b "$cookie_file" \
      -H 'Content-Type: application/json' \
      -X POST \
      "$ATLAS_FRONTEND_URL/api/auth/login" \
      -d "{
        \"email\": \"$email\",
        \"password\": \"$ATLAS_TEST_PASSWORD\"
      }"
  )"

  echo "$response" | jq

  if [ ! -s "$cookie_file" ]; then
    echo "ERROR: No cookie jar created at $cookie_file" >&2
    return 1
  fi

  echo
  echo "Cookie jar: $cookie_file"
}


# -----------------------------------------------------------------------------
# Login commands
# -----------------------------------------------------------------------------

atlas_login_admin() {
  _atlas_login \
    "admin" \
    "$ATLAS_ADMIN_EMAIL" \
    "$ATLAS_ADMIN_COOKIES"
}

atlas_login_instructor() {
  _atlas_login \
    "instructor" \
    "$ATLAS_INSTRUCTOR_EMAIL" \
    "$ATLAS_INSTRUCTOR_COOKIES"
}

atlas_login_student() {
  _atlas_login \
    "student" \
    "$ATLAS_STUDENT_EMAIL" \
    "$ATLAS_STUDENT_COOKIES"
}

atlas_login_all() {
  atlas_login_admin || return 1
  echo
  atlas_login_instructor || return 1
  echo
  atlas_login_student || return 1
}


# -----------------------------------------------------------------------------
# Frontend/BFF GET helpers
#
# Examples:
#   atlas_student_get /api/student/enrollments
#   atlas_student_get "/api/student/assessments?page=1&page_size=100"
# -----------------------------------------------------------------------------

atlas_admin_get() {
  curl -sS \
    -b "$ATLAS_ADMIN_COOKIES" \
    "$ATLAS_FRONTEND_URL$1" |
    jq
}

atlas_instructor_get() {
  curl -sS \
    -b "$ATLAS_INSTRUCTOR_COOKIES" \
    "$ATLAS_FRONTEND_URL$1" |
    jq
}

atlas_student_get() {
  curl -sS \
    -b "$ATLAS_STUDENT_COOKIES" \
    "$ATLAS_FRONTEND_URL$1" |
    jq
}


# -----------------------------------------------------------------------------
# Direct backend GET helpers
#
# NOTE:
# These only work if the cookie jar contains credentials accepted directly by
# the backend. In ATLAS, browser cookies are normally consumed by the frontend
# BFF, so prefer the BFF helpers for browser-flow tests.
#
# Examples:
#   atlas_backend_admin_get /admin/question-banks
# -----------------------------------------------------------------------------

atlas_backend_admin_get() {
  curl -sS \
    -b "$ATLAS_ADMIN_COOKIES" \
    "$ATLAS_BACKEND_URL$1" |
    jq
}

atlas_backend_instructor_get() {
  curl -sS \
    -b "$ATLAS_INSTRUCTOR_COOKIES" \
    "$ATLAS_BACKEND_URL$1" |
    jq
}

atlas_backend_student_get() {
  curl -sS \
    -b "$ATLAS_STUDENT_COOKIES" \
    "$ATLAS_BACKEND_URL$1" |
    jq
}


# -----------------------------------------------------------------------------
# Cookie inspection
# -----------------------------------------------------------------------------

atlas_cookies() {
  local role="$1"

  case "$role" in
    admin)
      cat "$ATLAS_ADMIN_COOKIES"
      ;;
    instructor)
      cat "$ATLAS_INSTRUCTOR_COOKIES"
      ;;
    student)
      cat "$ATLAS_STUDENT_COOKIES"
      ;;
    *)
      echo "Usage: atlas_cookies {admin|instructor|student}" >&2
      return 1
      ;;
  esac
}


# -----------------------------------------------------------------------------
# Clear sessions
# -----------------------------------------------------------------------------

atlas_clear_sessions() {
  rm -f \
    "$ATLAS_ADMIN_COOKIES" \
    "$ATLAS_INSTRUCTOR_COOKIES" \
    "$ATLAS_STUDENT_COOKIES"

  echo "ATLAS test cookie jars removed."
}


# -----------------------------------------------------------------------------
# Show configuration
# -----------------------------------------------------------------------------

atlas_env() {
  cat <<EOF
ATLAS test environment

Backend:
  $ATLAS_BACKEND_URL

Frontend:
  $ATLAS_FRONTEND_URL

Users:
  admin      $ATLAS_ADMIN_EMAIL
  instructor $ATLAS_INSTRUCTOR_EMAIL
  student    $ATLAS_STUDENT_EMAIL

Cookie jars:
  admin      $ATLAS_ADMIN_COOKIES
  instructor $ATLAS_INSTRUCTOR_COOKIES
  student    $ATLAS_STUDENT_COOKIES
EOF
}


# -----------------------------------------------------------------------------
# Help
# -----------------------------------------------------------------------------

atlas_help() {
  cat <<'EOF'
ATLAS manual testing helpers

Authentication:
  atlas_login_admin
  atlas_login_instructor
  atlas_login_student
  atlas_login_all

Frontend/BFF GET:
  atlas_admin_get PATH
  atlas_instructor_get PATH
  atlas_student_get PATH

Direct backend GET:
  atlas_backend_admin_get PATH
  atlas_backend_instructor_get PATH
  atlas_backend_student_get PATH

Utilities:
  atlas_cookies ROLE
  atlas_clear_sessions
  atlas_env
  atlas_help

Examples:

  atlas_login_student

  atlas_student_get /api/student/enrollments

  atlas_student_get \
    "/api/student/learning-records/UUID/question-banks?page=1&page_size=100"

  atlas_login_all

EOF
}
