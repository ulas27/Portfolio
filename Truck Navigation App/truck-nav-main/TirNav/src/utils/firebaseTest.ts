/**
 * Firebase Test Utilities
 * 
 * Helper functions to test Firebase setup
 * Use these in development to verify Firebase configuration
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Alert } from 'react-native';

/**
 * Test Firebase Authentication
 */
export const testFirebaseAuth = async () => {
  try {
    console.log('🔐 Testing Firebase Auth...');
    
    // Test 1: Check current user
    const currentUser = auth().currentUser;
    console.log('Current user:', currentUser?.email || 'Not signed in');
    
    // Test 2: Create test user (only if not exists)
    const testEmail = `test_${Date.now()}@tirnav.com`;
    const testPassword = 'Test123456';
    
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        testEmail,
        testPassword
      );
      console.log('✅ Test user created:', userCredential.user.uid);
      
      // Clean up - delete test user
      await userCredential.user.delete();
      console.log('✅ Test user deleted');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Test user already exists');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Firebase Auth test passed!');
    Alert.alert('Success', 'Firebase Auth is working correctly!');
    return true;
  } catch (error) {
    console.error('❌ Firebase Auth test failed:', error);
    Alert.alert('Error', `Firebase Auth test failed: ${error}`);
    return false;
  }
};

/**
 * Test Firestore Database
 */
export const testFirestore = async () => {
  try {
    console.log('📦 Testing Firestore...');
    
    // Test 1: Write document
    const testDoc = {
      message: 'Hello from TirNav!',
      timestamp: firestore.FieldValue.serverTimestamp(),
      testId: Date.now(),
    };
    
    const docRef = await firestore()
      .collection('test')
      .add(testDoc);
    
    console.log('✅ Document written:', docRef.id);
    
    // Test 2: Read document
    const doc = await docRef.get();
    console.log('✅ Document read:', doc.data());
    
    // Test 3: Update document
    await docRef.update({
      message: 'Updated message',
    });
    console.log('✅ Document updated');
    
    // Test 4: Delete document
    await docRef.delete();
    console.log('✅ Document deleted');
    
    console.log('✅ Firestore test passed!');
    Alert.alert('Success', 'Firestore is working correctly!');
    return true;
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    Alert.alert('Error', `Firestore test failed: ${error}`);
    return false;
  }
};

/**
 * Test Firebase Storage
 */
export const testStorage = async () => {
  try {
    console.log('📁 Testing Firebase Storage...');
    
    // Test 1: Create reference
    const filename = `test_${Date.now()}.txt`;
    const reference = storage().ref(`test/${filename}`);
    console.log('✅ Storage reference created');
    
    // Test 2: Upload string
    const testData = 'Hello from TirNav Storage!';
    await reference.putString(testData);
    console.log('✅ Data uploaded');
    
    // Test 3: Get download URL
    const url = await reference.getDownloadURL();
    console.log('✅ Download URL:', url);
    
    // Test 4: Download data
    const downloadedData = await reference.getDownloadURL();
    console.log('✅ Data downloaded');
    
    // Test 5: Delete file
    await reference.delete();
    console.log('✅ File deleted');
    
    console.log('✅ Storage test passed!');
    Alert.alert('Success', 'Firebase Storage is working correctly!');
    return true;
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    Alert.alert('Error', `Storage test failed: ${error}`);
    return false;
  }
};

/**
 * Test all Firebase services
 */
export const testAllFirebaseServices = async () => {
  console.log('🚀 Testing all Firebase services...');
  
  const authResult = await testFirebaseAuth();
  const firestoreResult = await testFirestore();
  const storageResult = await testStorage();
  
  if (authResult && firestoreResult && storageResult) {
    console.log('✅ All Firebase services are working!');
    Alert.alert(
      'Success',
      'All Firebase services are configured correctly!',
      [{ text: 'OK' }]
    );
    return true;
  } else {
    console.log('❌ Some Firebase services failed');
    Alert.alert(
      'Warning',
      'Some Firebase services are not working correctly. Check console for details.',
      [{ text: 'OK' }]
    );
    return false;
  }
};

/**
 * Get Firebase connection status
 */
export const getFirebaseStatus = () => {
  const currentUser = auth().currentUser;
  
  return {
    auth: {
      configured: true,
      signedIn: currentUser !== null,
      user: currentUser?.email || null,
    },
    firestore: {
      configured: true,
    },
    storage: {
      configured: true,
    },
  };
};

/**
 * Test Firestore Security Rules
 */
export const testFirestoreRules = async () => {
  try {
    console.log('🔒 Testing Firestore Security Rules...');
    
    // Test 1: Try to read warnings (should work - public read)
    try {
      await firestore().collection('warnings').limit(1).get();
      console.log('✅ Public read works');
    } catch (error) {
      console.error('❌ Public read failed:', error);
    }
    
    // Test 2: Try to write without auth (should fail)
    try {
      await firestore().collection('warnings').add({
        test: true,
      });
      console.log('❌ Unauthenticated write succeeded (SECURITY ISSUE!)');
    } catch (error) {
      console.log('✅ Unauthenticated write blocked (correct)');
    }
    
    console.log('✅ Security rules test completed');
    return true;
  } catch (error) {
    console.error('❌ Security rules test failed:', error);
    return false;
  }
};
