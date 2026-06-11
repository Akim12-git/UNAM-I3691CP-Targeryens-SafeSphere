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
