# Firebase Integration Notes

Although the production site runs in demo mode, the data model mirrors a Firestore layout so the UI can plug into a Firebase project.

## Recommended collections

```
families (collection)
  {familyId} (document)
    name: string
    ownerUid: string
    zipCode: string
    subscriptionStatus: "active" | "inactive"
    subscriptionExpiry: timestamp | null

families/{familyId}/kids (collection)
  {kidId} (document)
    name: string
    costume: string
    birthYear: number
    favoriteQuote: string
    location: {
      city: string
      state: string
      postalCode: string
      latitude: number
      longitude: number
    }

families/{familyId}/kids/{kidId}/collections (collection)
  {collectionId} (document)
    year: number
    theme: string
    event: string
    notes: string

families/{familyId}/kids/{kidId}/collections/{collectionId}/candy (collection)
  {candyId} (document)
    type: string
    quantity: number
    rating: number
    notes: string
    color: string
    updatedAt: timestamp
```

## Firestore security rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{familyId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerUid;

      match /kids/{kidId} {
        allow read, write: if request.auth != null && request.auth.uid == get(/databases/$(database)/documents/families/$(familyId)).data.ownerUid;

        match /collections/{collectionId} {
          allow read, write: if request.auth != null && request.auth.uid == get(/databases/$(database)/documents/families/$(familyId)).data.ownerUid;

          match /candy/{candyId} {
            allow read, write: if request.auth != null && request.auth.uid == get(/databases/$(database)/documents/families/$(familyId)).data.ownerUid;
          }
        }
      }
    }
  }
}
```

### Additional recommendations

- Use **Firebase Authentication** with Google as a provider so the sign-in button triggers a real OAuth flow.
- Store catalog metadata (candy names and colors) in a separate collection or in Remote Config if you want to manage it centrally.
- Run a scheduled Cloud Function that downgrades `subscriptionStatus` to `inactive` when `subscriptionExpiry` has passed.
- Enable Firestore indexes on `{familyId}/kids/{kidId}/collections` ordered by `year` descending for fast timeline queries.
