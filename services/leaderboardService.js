import { firestore, auth } from './firebaseSetup';

export const syncContactsToLeaderboard = async (contactsArray) => {
  // TODO: Hash phone numbers and query Firestore Users collection
};

export const fetchLeaderboard = async () => {
  // TODO: Fetch matched friends from Firestore ordered by totalScore
};
