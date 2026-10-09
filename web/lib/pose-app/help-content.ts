/**
 * The Help Centre's question list, lifted from `showHelpCenter()` @44726 in the
 * legacy `index.html`. Each answer keeps the legacy markup so the accordion
 * renders the same paragraphs and links as the injected HTML did.
 */

export type HelpItem = { question: string; answer: string };
export type HelpCategory = { title: string; items: HelpItem[] };

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    "title": "Getting Started",
    "items": [
      {
        "question": "How to create an account",
        "answer": "To create an account, click on the \"Sign Up\" button on the login page. Fill in your details including your email address and create a password. Verify your email by clicking the link sent to your inbox, and you're all set!"
      },
      {
        "question": "Setting up your profile",
        "answer": "After creating your account, go to your profile by clicking on your avatar. Click \"Edit Profile\" to add a profile picture, bio, and other personal information. Remember to save your changes when you're done."
      },
      {
        "question": "Uploading your first content",
        "answer": "To upload content, tap the upload button in the bottom navigation. Select your video or image, add a title and description, and choose your privacy settings. Tap \"Post\" to share with your followers."
      }
    ]
  },
  {
    "title": "Account & Privacy",
    "items": [
      {
        "question": "Changing your password",
        "answer": "Go to Settings > Account > Password & Security. Enter your current password, then create and confirm your new password. For security, use a strong password with a mix of letters, numbers, and symbols."
      },
      {
        "question": "Privacy settings",
        "answer": "Manage who can see your content by going to Settings > Privacy. You can set your account to private, control who can message you, and manage blocked accounts. Review these settings regularly to maintain your desired privacy level."
      },
      {
        "question": "Managing notifications",
        "answer": "Control which notifications you receive by going to Settings > Notifications. You can customize notifications for likes, comments, messages, and more. Toggle off any notifications you don't want to receive."
      }
    ]
  },
  {
    "title": "Troubleshooting",
    "items": [
      {
        "question": "App crashing or freezing",
        "answer": "If the app crashes or freezes, try these steps: 1) Close and reopen the app, 2) Restart your device, 3) Check for app updates, 4) Clear the app cache in your device settings, 5) If problems persist, reinstall the app."
      },
      {
        "question": "Can't upload content",
        "answer": "If you're having trouble uploading content, check your internet connection, ensure you have sufficient storage space, and verify the file type and size are supported. If issues persist, try uploading from a different device."
      },
      {
        "question": "Login issues",
        "answer": "If you can't log in, try resetting your password using the \"Forgot Password\" option. Make sure you're using the correct email address and check for typos. If you still can't access your account, contact our support team for assistance."
      }
    ]
  }
];
