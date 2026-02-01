<?php
/**
 * Registration System - Main Entry Point
 * This is the primary file that includes all components
 */

require_once '../includes/env.php';

// Include header (meta tags, stylesheets, scripts)
include '../html/header.php';

// Landing Page Content
include 'landing-page.php';

// Registration Modal
include 'modal-registration.php';

// Success Modal
include 'modal-success.php';

// Footer (scripts and closing tags)
include '../html/footer.php';
?>
