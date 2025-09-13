# Formspree Integration Setup Guide

## Overview
The contact page has been successfully wired to Formspree for form handling. Here's how to complete the setup:

## 1. Create a Formspree Account
1. Go to [formspree.io](https://formspree.io)
2. Sign up for a free account
3. Verify your email address

## 2. Create a New Form
1. In your Formspree dashboard, click "New Form"
2. Choose "Contact Form" or "Custom Form"
3. Set the form name to "LocalBox Contact Form"
4. Copy the form ID (it will look like ``)

## 3. Form ID Configuration ✅
Your Formspree form ID `` has been configured in:

### `app/contact/page.tsx` (Line 43)
```typescript
const response = await fetch('https://formspree.io/f/', {
```

**Status**: ✅ Already configured and ready to use!

## 4. Configure Formspree Settings
In your Formspree dashboard:

### Form Settings
- **Form Name**: "LocalBox Contact Form"
- **Email Notifications**: Enable
- **Auto-responder**: Optional (recommended)
- **Spam Protection**: Enable reCAPTCHA if desired

### Email Settings
- **To Email**: Your business email
- **Subject**: "Implementation Plan Request from {{name}}"
- **Reply-To**: "{{email}}"

### Advanced Settings
- **Allowed Domains**: Add your production domain
- **Rate Limiting**: Configure as needed
- **Webhooks**: Optional (for advanced integrations)

## 5. Test the Integration
Run the test script to verify everything works:

```bash
npx tsx scripts/test-formspree.ts
```

## 6. Form Features Implemented

### ✅ Form Validation
- Required field validation (name, email)
- Email format validation
- Client-side validation before submission

### ✅ User Experience
- Loading states with spinner
- Success/error messages with animations
- Form reset after successful submission
- Disabled form during submission

### ✅ Formspree Integration
- Proper JSON payload structure
- Custom subject line with sender name
- Reply-to email configuration
- Success redirect handling

### ✅ Error Handling
- Network error handling
- Formspree API error handling
- User-friendly error messages
- Retry functionality

## 7. Form Data Structure
The form sends the following data to Formspree:

```json
{
  "name": "User's full name",
  "email": "user@company.com",
  "company": "Company name",
  "message": "User's message",
  "_subject": "Implementation Plan Request from [Name]",
  "_replyto": "user@company.com",
  "_next": "https://yourdomain.com/contact?success=true"
}
```

## 8. Security Considerations
- Formspree handles spam protection
- No sensitive data is stored client-side
- HTTPS required for production
- Rate limiting configured in Formspree

## 9. Monitoring & Analytics
- Check Formspree dashboard for submissions
- Monitor form conversion rates
- Set up email notifications for new submissions
- Consider adding Google Analytics events

## 10. Production Checklist
- [x] Replace `YOUR_FORM_ID` with actual Formspree form ID ✅
- [ ] Test form submission on production domain
- [ ] Configure allowed domains in Formspree
- [ ] Set up email notifications
- [ ] Test auto-responder (if enabled)
- [ ] Verify spam protection is working
- [ ] Monitor first few submissions manually

## Troubleshooting

### Common Issues
1. **404 Form Not Found**: Check that the form ID is correct
2. **CORS Errors**: Ensure your domain is added to allowed domains
3. **Spam Filtering**: Check Formspree spam folder
4. **Email Delivery**: Verify email settings in Formspree

### Debug Mode
Enable debug mode in Formspree to see detailed error messages and submission logs.

## Support
- [Formspree Documentation](https://formspree.io/help/)
- [Formspree Support](https://formspree.io/contact/)
- [LocalBox Contact Form Issues](mailto:support@localboxs.com)
