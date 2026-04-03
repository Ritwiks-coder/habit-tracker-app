import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// 1. Initialize the instances here
const authInstance = auth();
const firestoreInstance = firestore();

// 2. Export them as objects (NOT functions)
export { authInstance as auth, firestoreInstance as firestore };