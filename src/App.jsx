import React, { useState, useEffect, useCallback } from 'react';

// --- REMOVED: Top-level bare module imports which caused the build failure ---
/*
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, deleteDoc, doc, serverTimestamp, setLogLevel, updateDoc, } from 'firebase/firestore';
*/

// --- LUCIDE ICONS (Inline SVG for single-file compatibility) ---

const FormInput = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="14" y2="14"/><line x1="16" x2="8" y1="18" y2="18"/><line x1="10" x2="8" y1="10" y2="10"/></svg>);
const List = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="11" x2="20" y1="12" y2="12"/><line x1="11" x2="20" y1="6" y2="6"/><line x1="11" x2="20" y1="18" y2="18"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/></svg>);
const Mail = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const PanelTop = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/></svg>);
const Trash2 = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>);
const Send = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>);
const Pencil = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>);
const X = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>);
const Loader2 = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>);

// --- TOAST/ALERT/MODAL HELPERS (Tailwind version of Chakra components) ---

// Custom Toast/Notification System
const Toast = ({ message, type = 'info', title, onDismiss }) => {
    if (!message) return null;

    const colors = {
        success: { bg: 'bg-green-100 border-green-400 text-green-700', icon: '✅' },
        error: { bg: 'bg-red-100 border-red-400 text-red-700', icon: '❌' },
        warning: { bg: 'bg-yellow-100 border-yellow-400 text-yellow-700', icon: '⚠️' },
        info: { bg: 'bg-blue-100 border-blue-400 text-blue-700', icon: 'ℹ️' },
    };

    const { bg, icon } = colors[type] || colors.info;

    return (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg border-l-4 ${bg} transition-opacity duration-300 ease-in-out`}>
            <div className="flex items-start">
                <span className="text-xl mr-3">{icon}</span>
                <div className="flex-grow">
                    <p className="font-bold text-sm">{title || type.charAt(0).toUpperCase() + type.slice(1)}</p>
                    <p className="text-sm">{message}</p>
                </div>
                <button 
                    onClick={onDismiss} 
                    className="ml-4 -mr-2 -mt-2 p-1 rounded-full hover:bg-opacity-70 transition"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Custom Modal Component
const ModalComponent = ({ isOpen, onClose, title, children, footer, headerBgClass = 'bg-gray-100' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className={`p-4 sm:p-6 flex justify-between items-center ${headerBgClass} rounded-t-xl border-b`}>
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 transition"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {/* Body */}
                <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
                {/* Footer */}
                {footer && (
                    <div className="p-4 sm:p-6 border-t flex justify-end space-x-3 rounded-b-xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};


// Custom Hook for Toast Management (Mimics useToast)
const useSimpleToast = () => {
    const [toastState, setToastState] = useState(null);

    const showToast = useCallback(({ title, description, status, duration = 5000 }) => {
        setToastState({ title: title, message: description, type: status });
        
        // Auto-dismiss after duration
        setTimeout(() => setToastState(null), duration);
    }, []);

    const dismissToast = useCallback(() => setToastState(null), []);

    return [toastState, showToast, dismissToast];
};


// --- FIREBASE CONFIGURATION & HOOKS ---

// FALLBACK: Use global variables provided by the Canvas/runtime environment
const globalAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const globalFirebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const globalAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Determine config source: Use global variables provided by the Canvas/runtime environment
const appId = globalAppId;
const firebaseConfig = globalFirebaseConfig;
const initialAuthToken = globalAuthToken; 

// The collection path for public data: /artifacts/{appId}/public/data/{collectionName}
const COLLECTION_NAME = 'submissions';


// State hook for Firebase initialization
function useFirebase(showToast) {
    // State to hold dynamically loaded Firebase functions and instances
    const [firebaseServices, setFirebaseServices] = useState({
        db: null,
        userId: null,
        isAuthReady: false,
        // Firestore functions
        collection: null, addDoc: null, onSnapshot: null, query: null, deleteDoc: null, doc: null, serverTimestamp: null, updateDoc: null,
    });

    useEffect(() => {
        
        // Check if configuration exists
        if (!firebaseConfig || !firebaseConfig.projectId) {
            console.error("Firebase Configuration Missing or Invalid.");
            showToast({
                title: 'Config Missing',
                description: 'Firebase configuration is missing. App will not function.',
                status: 'error',
                duration: 9000,
            });
            setFirebaseServices(s => ({ ...s, isAuthReady: true }));
            return;
        }

        async function loadAndInitFirebase() {
            try {
                // 1. Dynamic CDN Imports (Fixes the build error)
                const [
                    { initializeApp },
                    authModule,
                    firestoreModule,
                ] = await Promise.all([
                    // Use the official Firebase CDN links
                    import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js'),
                    import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js'),
                    import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'),
                ]);

                // 2. Destructure necessary functions from the loaded modules
                const { 
                    getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
                } = authModule;

                const { 
                    getFirestore, collection, addDoc, onSnapshot, query, deleteDoc, doc, serverTimestamp, setLogLevel, updateDoc 
                } = firestoreModule;

                // Set Firestore log level for debugging
                setLogLevel('debug');
                
                // 3. Initialize App and Services
                const app = initializeApp(firebaseConfig);
                const firestore = getFirestore(app);
                const auth = getAuth(app);

                let unsubscribeAuth;

                // 4. Handle Authentication
                unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
                    let currentUserId = null;
                    if (user) {
                        currentUserId = user.uid;
                    } else {
                        // Attempt sign-in with custom token, or anonymously if token is missing
                        try {
                            if (initialAuthToken) {
                                const cred = await signInWithCustomToken(auth, initialAuthToken);
                                currentUserId = cred.user.uid;
                            } else {
                                const cred = await signInAnonymously(auth); 
                                currentUserId = cred.user.uid;
                            }
                        } catch (error) {
                            console.error("Authentication Error:", error);
                            showToast({ title: 'Authentication Error', description: error.message, status: 'error', duration: 9000 });
                            // Fallback user ID if sign-in fails
                            currentUserId = crypto.randomUUID(); 
                        }
                    }

                    // 5. Update state with services and user info
                    setFirebaseServices({
                        db: firestore,
                        userId: currentUserId,
                        isAuthReady: true,
                        collection, addDoc, onSnapshot, query, deleteDoc, doc, serverTimestamp, updateDoc
                    });
                });

                return () => {
                    if (unsubscribeAuth) unsubscribeAuth();
                };

            } catch (e) {
                console.error("Firebase Initialization/Load Error:", e);
                showToast({
                    title: 'Firebase Load Failed',
                    description: 'Could not load Firebase libraries via CDN. Check console for details.',
                    status: 'error',
                    duration: 9000,
                });
                setFirebaseServices(s => ({ ...s, isAuthReady: true }));
            }
        }

        loadAndInitFirebase();
    }, [showToast]);

    return firebaseServices;
}

// --- DATA LOGIC HOOK ---
function useSubmissions(firebaseServices, showToast) {
    // Destructure required functions and state from the service object
    const { db, isAuthReady, collection, onSnapshot, query } = firebaseServices;

    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Guard clause: Do not attempt to query if services are not ready
        if (!db || !isAuthReady) {
            setIsLoading(false);
            return;
        }

        // Collection reference for public data
        const collectionPath = `artifacts/${appId}/public/data/${COLLECTION_NAME}`;
        const submissionsRef = collection(db, collectionPath);
        
        // Setup real-time listener (onSnapshot)
        const q = query(submissionsRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSubmissions = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                fetchedSubmissions.push({
                    id: doc.id,
                    ...data,
                    // Convert Firestore Timestamp to Date object for easier formatting
                    timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
                    updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
                });
            });
            // Sort by timestamp descending (newest first)
            fetchedSubmissions.sort((a, b) => b.timestamp - a.timestamp);
            setSubmissions(fetchedSubmissions);
            setIsLoading(false);
        }, (error) => {
            console.error("Firestore onSnapshot error:", error);
            showToast({
                title: 'Database Error',
                description: `Failed to fetch submissions: ${error.message}`,
                status: 'error',
                duration: 9000,
            });
            setIsLoading(false);
        });

        // Cleanup function for the listener
        return () => unsubscribe();
    }, [db, isAuthReady, collection, onSnapshot, query, showToast]);

    return { submissions, isLoading };
}

// --- COMPONENTS ---

// 2. Submission Form Component (Now handles both Create and Update)
const SubmissionForm = ({ firebaseServices, initialSubmission, onClose, showToast }) => {
    // Destructure required functions and state
    const { 
        db, userId, collection, addDoc, doc, serverTimestamp, updateDoc 
    } = firebaseServices;

  // Determine if we are editing or creating
  const isEditMode = !!initialSubmission;

  // Use initialSubmission state if available, otherwise use empty strings for creation
  const [form, setForm] = useState(
    initialSubmission || {
      name: '',
      email: '',
      subject: '',
      message: '',
    }
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error message on change
    if (errors[e.target.name]) {
        setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email is required.';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required.';
    if (!form.message.trim()) newErrors.message = 'Message is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!db || !userId) {
        showToast({
            title: 'System not ready',
            description: 'Database connection or user authentication not complete.',
            status: 'warning',
            duration: 5000,
        });
        return;
    }

    if (!validate()) {
      showToast({
        title: 'Validation Failed',
        description: 'Please correct the highlighted errors.',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const collectionPath = `artifacts/${appId}/public/data/${COLLECTION_NAME}`;

      if (isEditMode) {
        // --- UPDATE MODE ---
        const docRef = doc(db, collectionPath, initialSubmission.id);
        await updateDoc(docRef, {
            name: form.name,
            email: form.email,
            subject: form.subject,
            message: form.message,
            updatedAt: serverTimestamp(), // Record when the document was updated
        });

        showToast({
            title: 'Entry Updated',
            description: 'Submission has been successfully updated.',
            status: 'success',
            duration: 5000,
        });
        
        // If used in a modal (edit mode), close the modal
        if (onClose) onClose();

      } else {
        // --- CREATE MODE ---
        await addDoc(collection(db, collectionPath), {
          ...form,
          timestamp: serverTimestamp(),
          userId: userId, // Record who submitted the form (even if anonymous)
        });

        showToast({
          title: 'Submission Received',
          description: 'Thank you! Your message has been successfully recorded.',
          status: 'success',
          duration: 5000,
        });

        // Clear the form
        setForm({ name: '', email: '', subject: '', message: '' });
      }

    } catch (error) {
        console.error(isEditMode ? 'Update Error:' : 'Submission Error:', error);
      showToast({
        title: isEditMode ? 'Update Error' : 'Submission Error',
        description: `Failed to process: ${error.message}`,
        status: 'error',
        duration: 9000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, db, userId, initialSubmission, isEditMode, onClose, showToast, validate, collection, addDoc, doc, serverTimestamp, updateDoc]);

  // Shared form structure
  const fields = [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Subject', name: 'subject', type: 'text' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={field.name}>
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              className={`w-full p-3 border rounded-lg focus:ring-sky-500 focus:border-sky-500 transition duration-150 ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isSubmitting}
            />
            {errors[field.name] && <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>}
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="message">
          Message / Details
        </label>
        <textarea
          id="message"
          name="message"
          rows="4"
          value={form.message}
          onChange={handleChange}
          placeholder="Write your detailed message here..."
          className={`w-full p-3 border rounded-lg focus:ring-sky-500 focus:border-sky-500 transition duration-150 resize-y ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
          disabled={isSubmitting}
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
            <Loader2 className="animate-spin w-5 h-5 mr-2" />
        ) : isEditMode ? (
            <Pencil className="w-5 h-5 mr-2" />
        ) : (
            <Send className="w-5 h-5 mr-2" />
        )}
        {isSubmitting ? (isEditMode ? 'Saving Changes...' : 'Submitting...') : (isEditMode ? 'Update Submission' : 'Submit Message')}
      </button>
    </form>
  );
};

// 3. View Submission Modal
const ViewSubmissionModal = ({ isOpen, onClose, submission }) => {
    if (!submission) return null;

    const formattedTimestamp = submission.timestamp.toLocaleString();
    const formattedUpdatedAt = submission.updatedAt ? submission.updatedAt.toLocaleString() : 'N/A';

    return (
        <ModalComponent 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Submission Details"
        >
            <div className="space-y-4 text-gray-700">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <DetailItem label="Submitted" value={formattedTimestamp} />
                    <DetailItem label="Last Updated" value={formattedUpdatedAt} />
                    <DetailItem label="Submitted By (User ID)" value={submission.userId} />
                    <DetailItem label="Entry ID" value={submission.id} />
                </div>

                <DetailItem label="Name" value={submission.name} large />
                <DetailItem label="Email" value={submission.email} large />
                <DetailItem label="Subject" value={submission.subject} large />
                
                <div className="pt-2">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Message</h4>
                    <p className="bg-white p-4 border border-gray-200 rounded-lg whitespace-pre-wrap leading-relaxed text-gray-800 shadow-inner">
                        {submission.message}
                    </p>
                </div>
            </div>
        </ModalComponent>
    );
};

// Helper for Detail Items
const DetailItem = ({ label, value, large = false }) => (
    <div>
        <h4 className="text-sm font-medium text-gray-600 mb-0.5">{label}</h4>
        <p className={`font-semibold ${large ? 'text-lg' : 'text-base'} text-gray-800`}>{value}</p>
    </div>
);


// 4. Submission List Item
const SubmissionListItem = ({ submission, onEdit, onView, onDelete, showToast }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = useCallback(async () => {
        // Use a lightweight confirmation
        // NOTE: window.confirm() is used here as a simple, non-blocking fallback in a production environment.
        // For the canvas environment, a custom modal is preferred, but for a standalone React app, this is common practice.
        if (!window.confirm(`Are you sure you want to delete the submission from ${submission.name}? This action cannot be undone.`)) {
            return;
        }

        if (!onDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(submission.id);
            showToast({
                title: 'Deleted',
                description: 'The submission was successfully deleted.',
                status: 'success',
                duration: 3000,
            });
        } catch (error) {
            console.error("Delete failed:", error);
            showToast({
                title: 'Deletion Error',
                description: error.message,
                status: 'error',
                duration: 5000,
            });
        } finally {
            setIsDeleting(false);
        }
    }, [submission.id, submission.name, onDelete, showToast]);

    const formattedDate = submission.timestamp.toLocaleDateString();

    return (
        <div className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200">
            {/* Subject and Name */}
            <div className="flex-grow min-w-0 pr-4 cursor-pointer" onClick={() => onView(submission)}>
                <p className="text-lg font-semibold text-gray-800 truncate hover:text-sky-600 transition">
                    {submission.subject}
                </p>
                <p className="text-sm text-gray-500 truncate">
                    From: <span className="font-medium text-gray-600">{submission.name}</span> ({formattedDate})
                </p>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-2 flex-shrink-0">
                <button
                    onClick={() => onView(submission)}
                    className="p-2 text-sky-600 hover:bg-sky-50 rounded-full transition"
                    title="View Details"
                >
                    <List className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onEdit(submission)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                    title="Edit Submission"
                >
                    <Pencil className="w-5 h-5" />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition disabled:opacity-50"
                    title="Delete Submission"
                >
                    {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};

// 5. Admin Dashboard
const AdminDashboard = ({ firebaseServices, submissions, isLoading, showToast, isAuthReady }) => {
    const { db, doc, deleteDoc } = firebaseServices;
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleDelete = useCallback(async (id) => {
        if (!db || !doc || !deleteDoc) return;
        const collectionPath = `artifacts/${appId}/public/data/${COLLECTION_NAME}`;
        await deleteDoc(doc(db, collectionPath, id));
    }, [db, doc, deleteDoc]);

    const handleView = (submission) => {
        setSelectedSubmission(submission);
        setIsViewModalOpen(true);
    };

    const handleEdit = (submission) => {
        setSelectedSubmission(submission);
        setIsEditModalOpen(true);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
                <PanelTop className="w-8 h-8 mr-3 text-sky-600" />
                Admin Dashboard
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Submissions ({submissions.length})
                </h2>

                {/* Status Indicator */}
                {!isAuthReady || !db ? (
                    <div className="flex items-center text-orange-600 font-medium p-4 bg-orange-50 rounded-lg">
                         <Loader2 className="w-5 h-5 animate-spin mr-3" /> Waiting for authentication and database connection...
                    </div>
                ) : (
                    <>
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8 text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading submissions...
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="text-center p-10 bg-gray-50 rounded-lg text-gray-500">
                                <FormInput className="w-10 h-10 mx-auto mb-3" />
                                <p className="font-semibold">No submissions received yet.</p>
                                <p className="text-sm">Share the form link to start collecting data.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {submissions.map((sub) => (
                                    <SubmissionListItem
                                        key={sub.id}
                                        submission={sub}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        showToast={showToast}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <p className="text-sm text-gray-500 mt-6">
                **App ID:** <span className="font-mono bg-gray-100 p-1 rounded text-xs">{appId}</span> | 
                **User ID:** <span className="font-mono bg-gray-100 p-1 rounded text-xs">{firebaseServices.userId || 'Loading...'}</span>
            </p>

            {/* Modals */}
            <ViewSubmissionModal 
                isOpen={isViewModalOpen} 
                onClose={() => setIsViewModalOpen(false)}
                submission={selectedSubmission}
            />

            <ModalComponent
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit Submission: ${selectedSubmission?.subject || 'N/A'}`}
                headerBgClass="bg-indigo-50"
            >
                {selectedSubmission && (
                    <SubmissionForm 
                        firebaseServices={firebaseServices}
                        initialSubmission={selectedSubmission}
                        onClose={() => setIsEditModalOpen(false)}
                        showToast={showToast}
                    />
                )}
            </ModalComponent>
        </div>
    );
};


// 6. Main App Component
const App = () => {
    const [currentView, setCurrentView] = useState('form'); // 'form' or 'admin'
    const [toastState, showToast, dismissToast] = useSimpleToast();

    // Initialize Firebase and get connection details and functions
    const firebaseServices = useFirebase(showToast);
    
    // Fetch and manage submissions
    const { submissions, isLoading } = useSubmissions(firebaseServices, showToast);
    
    // Destructure for convenience
    const { db, isAuthReady } = firebaseServices;

    // Determine if we can show the admin view (basic check for connection)
    const canAccessAdmin = isAuthReady && db;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-white shadow-md border-b sticky top-0 z-10">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <PanelTop className="w-6 h-6 text-sky-600 mr-2" />
                            <span className="text-xl font-bold text-gray-900">
                                Submission Tracker
                            </span>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setCurrentView('form')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition duration-150 ${
                                    currentView === 'form' ? 'bg-sky-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                disabled={!isAuthReady}
                            >
                                <FormInput className="w-5 h-5 inline mr-1 -mt-0.5" /> Submit Form
                            </button>
                            <button
                                onClick={() => setCurrentView('admin')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition duration-150 ${
                                    currentView === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                disabled={!canAccessAdmin}
                            >
                                <List className="w-5 h-5 inline mr-1 -mt-0.5" /> View Submissions
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            <main>
                {currentView === 'form' ? (
                    <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto py-12">
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-100">
                            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                                <Mail className="w-7 h-7 mr-3 text-sky-600" /> New Submission
                            </h1>
                            <SubmissionForm 
                                firebaseServices={firebaseServices}
                                initialSubmission={null} // null for creation mode
                                onClose={() => {}} // No close handler in creation mode
                                showToast={showToast}
                            />
                        </div>
                    </div>
                ) : (
                    <AdminDashboard
                        firebaseServices={firebaseServices}
                        submissions={submissions}
                        isLoading={isLoading}
                        showToast={showToast}
                        isAuthReady={isAuthReady}
                    />
                )}
            </main>

            {/* Global Toast Notification */}
            <Toast 
                message={toastState?.message}
                title={toastState?.title}
                type={toastState?.type}
                onDismiss={dismissToast}
            />
        </div>
    );
};

export default App;
