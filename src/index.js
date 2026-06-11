 patch-4
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
rules_version = '2';    

service firebase.storage {
  match /b/{bucket}/o {
    function signedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    match /profileImages/{uid}/{fileName} {
      allow read: if isOwner(uid);
      allow create, update: if isOwner(uid)
        && fileName.matches('^[a-zA-Z0-9._-]+\\.(jpg|jpeg|png|webp)$')
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
      allow delete: if isOwner(uid);
    }
    

    match /courseAssets/{courseId}/{fileName} {
      allow read: if signedIn();
      allow create, update, delete: if signedIn() && request.auth.token.admin == true;
    }

    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}

