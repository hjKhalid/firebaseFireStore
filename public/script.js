// Global variables
let lastVisibleDocument = null;
const batchSize = 50; // Number of documents to fetch per batch


// Toggles the display of the logout menu
document.getElementById('profileIcon').addEventListener('click', function () {
  var logoutMenu = document.getElementById('logoutMenu');
  logoutMenu.style.display = logoutMenu.style.display === 'none' ? 'block' : 'none';
});

// Logout function
document.getElementById('logoutButton').addEventListener('click', function () {
  // Perform logout operations here
  // For simplicity, this example just redirects to a login page
  window.location.href = 'login.html'; // Replace 'login.html' with your actual login page
});

var userUrl = "";

// const firebaseURLDBPath = document.getElementById('firestorePath')
// console.log(firebaseURLDBPath.value);

function getValue() {

}


///////////////////////////////////////////////////////////////////////////////////////////////		
// Firebase starter
///////////////////////////////////////////////////////////////////////////////////////////////

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";


// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "",
//   authDomain: "",
//   databaseURL: "",
//   projectId: "",
//   storageBucket: "",
//   messagingSenderId: "",
//   appId: "",
//   measurementId: ""
// };

// // Initialize Firebase
// const app = firebase.initializeApp(firebaseConfig);

// // Initialize Cloud Firestore and get a reference to the service
// const db = firebase.firestore(app);

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-analytics.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js"

// import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCNqAJvz1-W2rfu3RUni8I80k0VyxILxpw",
  authDomain: "firststore-f0a03.firebaseapp.com",
  databaseURL: "https://firststore-f0a03-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "firststore-f0a03",
  storageBucket: "firststore-f0a03.appspot.com",
  messagingSenderId: "87008909123",
  appId: "1:87008909123:web:48eb53ba9774af100a01f6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const querySnapshot = await getDocs(collection(db, "user"));
try {
  const docRef = await addDoc(collection(db, "user"), {
    first: "Ada",
    last: "Lovelace",
    born: 1815
  });
  console.log("Document written with ID: ", docRef.id);
} catch (e) {
  console.error("Error adding document: ", e);
}
console.log(querySnapshot);
querySnapshot.forEach((doc) => {
  console.log(`${doc.id} => ${doc.data()}`);
});
var details =[];
const colref = collection(db,"user");
getDocs(colref).then((snapshot)=>{
  let book = []
  snapshot.docs.forEach((doc)=>{
  book.push({...doc.data()})
  })
  // book = details
  console.log(book);
})
console.log(details);
//////////////////////////////////////////////////////////////////////////////
//initiaize UI and logic.
//////////////////////////////////////////////////////////////////////////////


//handle the "Go" button click.


document.getElementById('goButton').addEventListener('click', function () {
  const path = document.getElementById('firestorePath').value.trim();

  // Hide both the document and collection sections before checking the path
  document.getElementById('countDocs').style.display = 'none';
  document.getElementById('deleteDoc').style.display = 'none';
  document.getElementById('copyDoc').style.display = 'none';
  document.getElementById('pasteDoc').style.display = 'none';



  if (path) {
    // Determine if the path is for a collection or a document
    const pathSegments = path.split('/');
    if (pathSegments.length % 2 === 0) {
      // Even number of segments in the path; it's a document
      loadDocument(path);
      console.log(`path` + path);
    } else {
      // Odd number of segments in the path; it's a collection
      loadCollection(path);
    }
  } else {
    alert('Please enter a Firestore path.');
  }
});


//////////////////////////////////////////////////////////////////////////////
//Collection
//////////////////////////////////////////////////////////////////////////////

// Attach the event listener once, outside of the loadCollection function
document.getElementById('countDocs').addEventListener('click', function () {
  if (currentPath) {
    db.collection(currentPath).get().then(snapshot => {
      alert(snapshot.size); // Show count in an alert
    });
  }
});


//load collection's documents. 50 at a time.
function loadCollection(path) {
  const closeToBottomOfCollection = document.getElementById('firestoreContent');
  closeToBottomOfCollection.innerHTML = '';

  db.collection(path).limit(batchSize).get().then(snapshot => {
    lastVisibleDocument = snapshot.docs[snapshot.docs.length - 1];
    snapshot.forEach(doc => {
      const docDiv = document.createElement('div');
      docDiv.textContent = doc.id;
      closeToBottomOfCollection.appendChild(docDiv);
    });
  });

  adjustButtonVisibility('collection');
}

//lazy loading for more documents in the collection
function loadMoreCollection(path) {
  if (lastVisibleDocument) {
    db.collection(path).startAfter(lastVisibleDocument).limit(batchSize).get().then(snapshot => {
      lastVisibleDocument = snapshot.docs[snapshot.docs.length - 1];
      snapshot.forEach(doc => {
        const docDiv = document.createElement('div');
        docDiv.textContent = doc.id;
        closeToBottomOfCollection.appendChild(docDiv);
      });
    });
  }
}

// Scroll event listener
const closeToBottomOfCollection = document.getElementById('firestoreContent');
closeToBottomOfCollection.addEventListener('scroll', () => {
  if (closeToBottomOfCollection.scrollTop + closeToBottomOfCollection.clientHeight >= closeToBottomOfCollection.scrollHeight - 10) {
    loadMoreCollection(currentPath);
  }
});



//////////////////////////////////////////////////////////////////////////////
//Document:
//////////////////////////////////////////////////////////////////////////////


function loadDocument(path) {
  const closeToBottomOfCollection = document.getElementById('firestoreContent');
  closeToBottomOfCollection.innerHTML = ''; // Clear previous content

  currentPath = path; // Update the current path
  db.doc(path).get().then(doc => {
    if (!doc.exists) {
      closeToBottomOfCollection.innerHTML = 'Document does not exist!';
      return;
    }

    const data = doc.data();
    if (data.doNotReadMeFromUI) {
      closeToBottomOfCollection.innerHTML = 'This document is restricted and can’t be modified.';
      return;
    }

    Object.keys(data).forEach(key => {
      // Create a container div for each field
      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'field-container'; // Optional: for styling purposes

      // Create a label for the field
      const label = document.createElement('label');
      label.textContent = key + ': ';
      fieldDiv.appendChild(label);

      // Create an editable input for the field value
      const input = document.createElement('input');
      input.type = 'text';
      input.value = data[key];
      input.dataset.fieldName = key;

      // Update Firestore when the field value changes
      input.addEventListener('change', function () {
        const update = {};
        update[key] = this.value;
        db.doc(path).update(update).then(() => {
          console.log('Document successfully updated');
        }).catch(error => {
          console.error('Error updating document: ', error);
        });
      });

      fieldDiv.appendChild(input);
      closeToBottomOfCollection.appendChild(fieldDiv);
    });

    // Adjust button visibility as needed
    adjustButtonVisibility('document');
  });
}



//Delete Firestore document
document.getElementById('deleteDoc').addEventListener('click', function () {
  if (currentPath) {
    if (confirm('Are you sure you want to delete this document?')) {
      db.doc(currentPath).delete().then(() => {
        alert('Document successfully deleted');
        document.getElementById('firestoreContent').innerHTML = ''; // Clear the content area
        adjustButtonVisibility('none'); // Hide the buttons
      }).catch(error => {
        console.error('Error deleting document: ', error);
        alert('Failed to delete document');
      });
    }
  }
});



//Copy Firestore document , as JSON
document.getElementById('copyDoc').addEventListener('click', function () {
  if (currentPath) {
    db.doc(currentPath).get().then(doc => {
      if (doc.exists) {
        const docData = JSON.stringify(doc.data(), null, 2); // Pretty print JSON
        navigator.clipboard.writeText(docData).then(() => {
          alert('Document data copied to clipboard');
        }).catch(err => {
          console.error('Error copying text: ', err);
        });
      } else {
        alert('Document does not exist');
      }
    });
  }
});


//Paste and replace the content of a Firestore document, assuming you have a JSON copied
document.getElementById('pasteDoc').addEventListener('click', function () {
  if (currentPath) {
    // Focus on the hidden input and paste the JSON
    const hiddenInput = document.getElementById('jsonInput');
    hiddenInput.focus();
    navigator.clipboard.readText().then(clipText => {
      hiddenInput.value = clipText;
      try {
        const data = JSON.parse(hiddenInput.value);
        db.doc(currentPath).update(data).then(() => {
          alert('Document successfully updated with pasted JSON');
          loadDocument(currentPath); // Reload the document view
        }).catch(error => {
          console.error('Error updating document: ', error);
          console.log("hi");
          alert('Failed to update document');
        });
      } catch (error) {
        alert('Invalid JSON format');
        console.error('Error parsing JSON: ', error);
      }
    }).catch(err => {
      console.error('Error reading clipboard: ', err);
    });
  }
});

// Assuming 'firestore' is your Firestore instance

const exampleCollection = firestore.collection('example_collection');
console.log(exampleCollection);

// Function to generate a random string
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Function to add a random document
function addRandomDocument() {
  const randomData = {
    name: generateRandomString(5),
    age: Math.floor(Math.random() * 100),
    timestamp: new Date()
  };

  exampleCollection.add(randomData)
    .then(docRef => {
      console.log(`Document added with ID: ${docRef.id}`);
    })
    .catch(error => {
      console.error('Error adding document:', error);
    });
}

// Add multiple random documents
for (let i = 0; i < 5; i++) {
  addRandomDocument();
}

//////////////////////////////////////////////////////////////////////////////
//Useful functions
//////////////////////////////////////////////////////////////////////////////


function adjustButtonVisibility(type) {
  // Show or hide buttons based on the type ('document' or 'collection')
  document.getElementById('deleteDoc').style.display = type === 'document' ? 'block' : 'none';
  document.getElementById('copyDoc').style.display = type === 'document' ? 'block' : 'none';
  document.getElementById('pasteDoc').style.display = type === 'document' ? 'block' : 'none';
  document.getElementById('countDocs').style.display = type === 'collection' ? 'block' : 'none';
}



