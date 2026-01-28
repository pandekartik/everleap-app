export const emailTemplates = {
    "reset_password": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Everleap</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); max-width: 480px; width: 100%; padding: 48px 40px; border: 1px solid #e2e8f0; }
        .logo { height: 32px; display: block; margin: 0 auto 32px; }
        h1 { color: #0f172a; font-size: 24px; font-weight: 600; margin-bottom: 8px; text-align: center; letter-spacing: -0.025em; }
        .subtitle { color: #64748b; font-size: 15px; text-align: center; margin-bottom: 32px; line-height: 1.5; }
        .user-name { color: #0f172a; font-weight: 600; }
        .form-group { margin-bottom: 24px; }
        label { display: block; color: #334155; font-weight: 500; font-size: 14px; margin-bottom: 6px; }
        input[type="text"], input[type="password"] { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 15px; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .password-requirements { margin-top: 8px; font-size: 13px; color: #64748b; }
        .password-strength { height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 10px; overflow: hidden; }
        .password-strength-bar { height: 100%; transition: width 0.3s, background 0.3s; width: 0%; background: #ef4444; }
        .password-strength-bar.weak { width: 33%; background: #ef4444; }
        .password-strength-bar.medium { width: 66%; background: #f59e0b; }
        .password-strength-bar.strong { width: 100%; background: #10b981; }
        .error-message { background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 12px 16px; color: #991b1b; font-size: 14px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        .error-icon { width: 20px; height: 20px; flex-shrink: 0; }
        .btn { width: 100%; background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; border: none; font-weight: 500; font-size: 15px; cursor: pointer; transition: all 0.2s; }
        .btn:hover { background-color: #1e293b; }
        .btn:active { transform: translateY(1px); }
        .btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; text-align: center; }
        .password-wrapper { position: relative; }
        .password-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #64748b; padding: 4px; display: flex; align-items: center; justify-content: center; outline: none; }
        .password-toggle:hover { color: #334155; }
        .password-toggle:focus { color: #6366f1; }
    </style>
</head>
<body>
    <div class="container">
        <img src="/Logo.svg" alt="Everleap" class="logo">
        <h1>Reset Your Password</h1>
        <p class="subtitle">
            Hi <span class="user-name">{{ user_name }}</span>, enter your new password below.
        </p>
        <div class="form-group">
            <label>New Password</label>
            <div class="password-wrapper">
                <input type="password" id="new_password" placeholder="Enter your new password">
                <button type="button" class="password-toggle" onclick="togglePassword('new_password')">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
            </div>
            <div class="password-strength"><div class="password-strength-bar"></div></div>
            <p class="password-requirements">Must be at least 8 characters long</p>
        </div>
        <div class="form-group">
            <label>Confirm Password</label>
            <div class="password-wrapper">
                <input type="password" id="confirm_password" placeholder="Confirm your new password">
                <button type="button" class="password-toggle" onclick="togglePassword('confirm_password')">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
            </div>
        </div>
        <button class="btn">Reset Password</button>
        <div class="footer">© 2026 Everleap. All rights reserved.</div>
    </div>
    <script>
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const button = input.nextElementSibling;
            const svg = button.querySelector('svg');
            if (input.type === 'password') {
                input.type = 'text';
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />';
            } else {
                input.type = 'password';
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
            }
        }
    </script>
</body>
</html>`,

    "reset_success": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful - Everleap</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); max-width: 480px; width: 100%; padding: 48px 40px; text-align: center; border: 1px solid #e2e8f0; }
        .success-icon { width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #16a34a; }
        .success-icon svg { width: 32px; height: 32px; stroke: currentColor; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; fill: none; }
        h1 { color: #0f172a; font-size: 24px; font-weight: 600; margin-bottom: 12px; letter-spacing: -0.025em; }
        .message { color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 32px; }
        .user-name { color: #0f172a; font-weight: 600; }
        .btn { display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 15px; transition: all 0.2s; }
        .btn:hover { background-color: #1e293b; transform: translateY(-1px); }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; }
        .logo { height: 32px; margin-bottom: 24px; display: inline-block; }
        .security-note { background: #eff6ff; border-radius: 8px; padding: 16px; margin-top: 24px; font-size: 14px; color: #1e40af; text-align: left; border: 1px solid #dbeafe; }
        .security-note strong { display: block; margin-bottom: 4px; color: #1e3a8a; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <img src="/Logo.svg" alt="Everleap" class="logo">
        <div class="success-icon"><svg viewBox="0 0 52 52"><path d="M14 27l10 10 18-18" /></svg></div>
        <h1>Password Reset Successful!</h1>
        <p class="message">
            Hi <span class="user-name">{{ user_name }}</span>,<br><br>
            Your password has been successfully reset. You can now log in with your new password.
        </p>
        <a href="#" class="btn">Continue to Login</a>
        <div class="security-note"><strong>🔒 Security Tip</strong> For your security, make sure to use a unique password that you don't use on other websites.</div>
        <div class="footer">© 2026 Everleap. All rights reserved.</div>
    </div>
</body>
</html>`,

    "reset_error": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Error - Everleap</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); max-width: 480px; width: 100%; padding: 48px 40px; text-align: center; border: 1px solid #e2e8f0; }
        .error-icon { width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #dc2626; }
        .error-icon svg { width: 32px; height: 32px; stroke: currentColor; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; fill: none; }
        h1 { color: #0f172a; font-size: 24px; font-weight: 600; margin-bottom: 12px; letter-spacing: -0.025em; }
        .error-message { color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 32px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid #ef4444; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; }
        .logo { height: 32px; margin-bottom: 24px; display: inline-block; }
        .help-text { color: #64748b; font-size: 14px; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <img src="/Logo.svg" alt="Everleap" class="logo">
        <div class="error-icon"><svg viewBox="0 0 52 52"><line x1="16" y1="16" x2="36" y2="36" /><line x1="36" y1="16" x2="16" y2="36" /></svg></div>
        <h1>Password Reset Failed</h1>
        <div class="error-message">{{ error }}</div>
        <p class="help-text">If you continue to experience issues, please contact support or request a new password reset link.</p>
        <div class="footer">© 2026 Everleap. All rights reserved.</div>
    </div>
</body>
</html>`,

    "set_password": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Set Your Password - Everleap</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); max-width: 480px; width: 100%; padding: 48px 40px; border: 1px solid #e2e8f0; }
        .logo { height: 32px; display: block; margin: 0 auto 32px; }
        h1 { color: #0f172a; font-size: 24px; font-weight: 600; margin-bottom: 8px; text-align: center; letter-spacing: -0.025em; }
        .subtitle { color: #64748b; font-size: 15px; text-align: center; margin-bottom: 32px; line-height: 1.5; }
        .user-name { color: #0f172a; font-weight: 600; }
        .form-group { margin-bottom: 24px; }
        label { display: block; color: #334155; font-weight: 500; font-size: 14px; margin-bottom: 6px; }
        input[type="text"], input[type="password"] { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 15px; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .password-requirements { margin-top: 8px; font-size: 13px; color: #64748b; }
        .password-strength { height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 10px; overflow: hidden; }
        .password-strength-bar { height: 100%; transition: width 0.3s, background 0.3s; width: 0%; background: #ef4444; }
        .password-strength-bar.weak { width: 33%; background: #ef4444; }
        .password-strength-bar.medium { width: 66%; background: #f59e0b; }
        .password-strength-bar.strong { width: 100%; background: #10b981; }
        .btn { width: 100%; background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; border: none; font-weight: 500; font-size: 15px; cursor: pointer; transition: all 0.2s; }
        .btn:hover { background-color: #1e293b; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; text-align: center; }
        .password-wrapper { position: relative; }
        .password-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #64748b; padding: 4px; display: flex; align-items: center; justify-content: center; outline: none; }
        .password-toggle:hover { color: #334155; }
        .password-toggle:focus { color: #6366f1; }
    </style>
</head>
<body>
    <div class="container">
        <img src="/Logo.svg" alt="Everleap" class="logo">
        <h1>Set Your Password</h1>
        <p class="subtitle">Hi <span class="user-name">{{ user_name }}</span>, create a secure password to activate your account.</p>
        <div class="form-group">
            <label>New Password</label>
            <div class="password-wrapper">
                <input type="password" id="new_password" placeholder="Enter your password">
                <button type="button" class="password-toggle" onclick="togglePassword('new_password')">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
            </div>
            <div class="password-strength"><div class="password-strength-bar"></div></div>
            <p class="password-requirements">Must be at least 8 characters long</p>
        </div>
        <div class="form-group">
            <label>Re-Enter New Password</label>
            <div class="password-wrapper">
                <input type="password" id="confirm_password" placeholder="Confirm your password">
                <button type="button" class="password-toggle" onclick="togglePassword('confirm_password')">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
            </div>
        </div>
        <button class="btn">Set Password</button>
        <div class="footer">© 2026 Everleap. All rights reserved.</div>
    </div>
    <script>
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const button = input.nextElementSibling;
            const svg = button.querySelector('svg');
            if (input.type === 'password') {
                input.type = 'text';
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />';
            } else {
                input.type = 'password';
                svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />';
            }
        }
    </script>
</body>
</html>`,

    "set_password_success": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Set Successfully - Everleap</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); max-width: 480px; width: 100%; padding: 48px 40px; text-align: center; border: 1px solid #e2e8f0; }
        .logo { height: 32px; display: block; margin: 0 auto 32px; }
        .success-icon { width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #16a34a; }
        .success-icon svg { width: 32px; height: 32px; stroke: currentColor; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; fill: none; }
        h1 { color: #0f172a; font-size: 24px; font-weight: 600; margin-bottom: 12px; letter-spacing: -0.025em; }
        .message { color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 32px; }
        .btn { display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 15px; transition: all 0.2s; border: none; }
        .btn:hover { background-color: #1e293b; transform: translateY(-1px); }
        .redirect-notice { margin-top: 24px; color: #94a3b8; font-size: 14px; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <img src="/Logo.svg" alt="Everleap" class="logo">
        <div class="success-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg></div>
        <h1>Password Set Successfully!</h1>
        <p class="message">Your account has been activated. You can now log in to Everleap using your email and the password you just created.</p>
        <a href="#" class="btn">Go to Login</a>
        <p class="redirect-notice">Redirecting to login in <span>5</span> seconds...</p>
        <div class="footer">© 2026 Everleap. All rights reserved.</div>
    </div>
</body>
</html>`,

    "set_password_error": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activation Error - Everleap</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); max-width: 480px; width: 100%; padding: 48px 40px; text-align: center; border: 1px solid #e2e8f0; }
        .logo { height: 32px; display: block; margin: 0 auto 32px; }
        .error-icon { width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #dc2626; }
        .error-icon svg { width: 32px; height: 32px; stroke: currentColor; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; fill: none; }
        h1 { color: #0f172a; font-size: 24px; font-weight: 600; margin-bottom: 12px; letter-spacing: -0.025em; }
        .message { color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
        .error-details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 32px; text-align: left; }
        .error-details p { color: #991b1b; font-size: 14px; margin-bottom: 8px; line-height: 1.5; }
        .error-details strong { font-weight: 600; }
        .error-details ul { margin-top: 8px; margin-left: 20px; color: #991b1b; font-size: 14px; }
        .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn { padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 500; text-decoration: none; transition: all 0.2s; cursor: pointer; border: none; }
        .btn-primary { background-color: #0f172a; color: white; }
        .btn-primary:hover { background-color: #1e293b; transform: translateY(-1px); }
        .btn-secondary { background: white; color: #334155; border: 1px solid #cbd5e1; }
        .btn-secondary:hover { background: #f1f5f9; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <img src="/Logo.svg" alt="Everleap" class="logo">
        <div class="error-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" /></svg></div>
        <h1>Activation Link Invalid</h1>
        <p class="message">We couldn't activate your account. The activation link may have expired or is no longer valid.</p>
        <div class="error-details">
            <p><strong>Common reasons:</strong></p>
            <ul>
                <li>The activation link has expired (valid for 24 hours)</li>
                <li>The link was already used</li>
                <li>The link was modified or incomplete</li>
            </ul>
        </div>
        <div class="actions">
            <a href="#" class="btn btn-primary">Contact Support</a>
            <a href="#" class="btn btn-secondary">Go to Homepage</a>
        </div>
        <div class="footer">© 2026 Everleap. All rights reserved.</div>
    </div>
</body>
</html>`,

    "verify_success": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verified - Everleap</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); max-width: 480px; width: 100%; padding: 48px 40px; text-align: center; border: 1px solid #e2e8f0; }
        .success-icon { width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #16a34a; }
        .success-icon svg { width: 32px; height: 32px; stroke: currentColor; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; fill: none; }
        h1 { color: #0f172a; font-size: 24px; font-weight: 600; margin-bottom: 12px; letter-spacing: -0.025em; }
        .message { color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 32px; }
        .user-name { color: #0f172a; font-weight: 600; }
        .btn { display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 15px; transition: all 0.2s; }
        .btn:hover { background-color: #1e293b; transform: translateY(-1px); }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; }
        .logo { height: 32px; margin-bottom: 24px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <img src="/Logo.svg" alt="Everleap" class="logo">
        <div class="success-icon"><svg viewBox="0 0 52 52"><path d="M14 27l10 10 18-18" /></svg></div>
        <h1>Email Verified!</h1>
        <p class="message">
            Hi <span class="user-name">{{ user_name }}</span>,<br><br>
            {{ message }}
        </p>
        <a href="#" class="btn">Continue to Login</a>
        <div class="footer">© 2026 Everleap. All rights reserved.</div>
    </div>
</body>
</html>`,

    "verify_error": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Error - Everleap</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); max-width: 480px; width: 100%; padding: 48px 40px; text-align: center; border: 1px solid #e2e8f0; }
        .error-icon { width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #dc2626; }
        .error-icon svg { width: 32px; height: 32px; stroke: currentColor; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; fill: none; }
        h1 { color: #0f172a; font-size: 24px; font-weight: 600; margin-bottom: 12px; letter-spacing: -0.025em; }
        .error-message { color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 32px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid #ef4444; }
        .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; }
        .logo { height: 32px; margin-bottom: 24px; display: inline-block; }
        .help-text { color: #64748b; font-size: 14px; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <img src="/Logo.svg" alt="Everleap" class="logo">
        <div class="error-icon"><svg viewBox="0 0 52 52"><line x1="16" y1="16" x2="36" y2="36" /><line x1="36" y1="16" x2="16" y2="36" /></svg></div>
        <h1>Verification Failed</h1>
        <div class="error-message">{{ error }}</div>
        <p class="help-text">If you continue to experience issues, please contact support.</p>
        <div class="footer">© 2026 Everleap. All rights reserved.</div>
    </div>
</body>
</html>`
};
