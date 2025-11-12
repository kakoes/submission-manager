import React, { useState, useEffect, useCallback } from 'react';
import {
  initializeApp
} from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  deleteDoc,
  doc,
  serverTimestamp,
  setLogLevel,
  updateDoc,
} from 'firebase/firestore';

// --- LUCIDE ICONS (Inline SVG for single-file compatibility) ---

const FormInput = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="14" y2="14"/><line x1="16" x2="8" y1="18" y2="18"/><line x1="10" x2="8" y1="10" y2="10"/></svg>);
const List = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="11" x2="20" y1="12" y2="12"/><line x1="11" x2="20" y1="6" y2="6"/><line x1="11" x2="20" y1="18" y2="18"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/></svg>);
const Mail = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const PanelTop = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/></svg>);
const Trash2 = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>);
const Send = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>);
const Clipboard = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>);
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

// MANDATORY: Access global variables provided by the Canvas environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null; 

// The collection path for public data: /artifacts/{appId}/public/data/{collectionName}
const COLLECTION_NAME = 'submissions';

// State hook for Firebase initialization
function useFirebase(showToast) {
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Set Firestore log level for debugging
    setLogLevel('debug');
    
    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const auth = getAuth(app);

      setDb(firestore);

      // 1. Handle Authentication
      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          setIsAuthReady(true);
        } else {
          // Attempt sign-in with custom token, or anonymously if token is missing
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(auth, initialAuthToken);
            } else {
              await signInAnonymously(auth);
            }
          } catch (error) {
            showToast({
              title: 'Authentication Error',
              description: error.message,
              status: 'error',
              duration: 9000,
            });
          }
          // IMPORTANT: Set ready state regardless of authentication success/failure
          setIsAuthReady(true);
        }
      });

      return () => {
        unsubscribeAuth();
      };
    } catch (e) {
        console.error("Firebase Initialization Error:", e);
        showToast({
            title: 'Firebase Initialization Failed',
            description: 'Could not initialize Firebase. Check console for details.',
            status: 'error',
            duration: 9000,
        });
        setIsAuthReady(true);
    }
  }, [showToast]);

  return {
    db,
    userId,
    isAuthReady,
  };
}

// --- DATA LOGIC HOOK ---
function useSubmissions(db, isAuthReady, showToast) {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
    }, [db, isAuthReady, showToast]);

    return { submissions, isLoading };
}

// --- COMPONENTS ---

// 2. Submission Form Component (Now handles both Create and Update)
const SubmissionForm = ({ db, userId, initialSubmission, onClose, showToast }) => {
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
  }, [form, db, userId, showToast, isEditMode, initialSubmission, onClose, validate]);

  return (
    <div className={`max-w-md mx-auto ${isEditMode ? 'p-0' : 'p-6'}`}>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col space-y-6 ${isEditMode ? 'p-0' : 'p-8 bg-white shadow-2xl rounded-xl'}`}
      >
        <h2 className={`text-2xl font-bold flex items-center space-x-2 ${isEditMode ? 'text-orange-600' : 'text-teal-600'}`}>
            <Mail className="w-6 h-6" />
            <span>{isEditMode ? 'Edit Submission' : 'Contact Submission Form'}</span>
        </h2>
        {!isEditMode && (
            <p className="text-gray-600">
                Submit your query below. All entries are saved to the Admin Dashboard.
            </p>
        )}

        {/* Name Field */}
        <div className="flex flex-col">
          <label htmlFor="name" className="font-semibold mb-1 text-gray-700">Name</label>
          <input
            id="name"
            name="name"
            placeholder="Your Full Name"
            value={form.name}
            onChange={handleChange}
            className={`p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div className="flex flex-col">
          <label htmlFor="email" className="font-semibold mb-1 text-gray-700">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className={`p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Subject Field */}
        <div className="flex flex-col">
          <label htmlFor="subject" className="font-semibold mb-1 text-gray-700">Subject</label>
          <input
            id="subject"
            name="subject"
            placeholder="Topic of your message"
            value={form.subject}
            onChange={handleChange}
            className={`p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
        </div>

        {/* Message Field */}
        <div className="flex flex-col">
          <label htmlFor="message" className="font-semibold mb-1 text-gray-700">Message</label>
          <textarea
            id="message"
            name="message"
            placeholder="Write your message here..."
            value={form.message}
            onChange={handleChange}
            rows={5}
            className={`p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-xl text-white font-bold transition duration-200 shadow-md hover:shadow-lg 
            ${isEditMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-teal-600 hover:bg-teal-700'} 
            ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isEditMode ? "Saving Changes..." : "Submitting..."}</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{isEditMode ? 'Save Changes' : 'Send Submission'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};


// 3. Admin Dashboard Component
const AdminDashboard = ({ db, submissions, isLoading, userId, showToast }) => {
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Modal state for View Details / Delete Confirmation
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Modal state for Edit Submission
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [submissionToEdit, setSubmissionToEdit] = useState(null);

    const formatTime = (date) => {
        if (!date) return 'N/A';
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const handleDelete = useCallback(async (id) => {
        if (!db || !id) return;
        setIsDeleting(true);
        try {
            const docPath = `artifacts/${appId}/public/data/${COLLECTION_NAME}/${id}`;
            await deleteDoc(doc(db, docPath));
            
            showToast({
                title: 'Deleted',
                description: 'Submission has been permanently removed.',
                status: 'success',
                duration: 3000,
            });
            setIsDetailModalOpen(false); // Close detail modal after successful delete
        } catch (error) {
            console.error("Deletion error:", error);
            showToast({
                title: 'Deletion Failed',
                description: `Could not delete: ${error.message}`,
                status: 'error',
                duration: 5000,
            });
        } finally {
            setIsDeleting(false);
        }
    }, [db, showToast]);
    
    // Function to open the detail modal
    const openDetails = (submission) => {
        setSelectedSubmission(submission);
        setIsDetailModalOpen(true);
    };

    // Function to open the edit modal
    const startEdit = (submission) => {
        setSubmissionToEdit(submission);
        setIsEditModalOpen(true);
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white p-8 rounded-xl shadow-2xl space-y-6">
                <h2 className="text-3xl font-bold text-blue-600 flex items-center space-x-3">
                    <PanelTop className="w-8 h-8" />
                    <span>Admin Dashboard</span>
                </h2>
                <p className="text-gray-600">
                    Review and manage all contact form submissions (<span className="font-semibold">{submissions.length}</span> total entries).
                </p>

                <div className="flex justify-between items-center border-b pb-4">
                    <p className="text-sm text-gray-500 font-mono">
                        **User ID:** {userId || 'Authenticating...'}
                    </p>
                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                        Public Data
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center py-10">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <p className="mt-4 text-lg text-gray-700">Loading submissions in real-time...</p>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="flex flex-col items-center py-10 text-gray-500">
                        <List className="w-12 h-12" />
                        <p className="text-xl mt-4">No submissions yet.</p>
                        <p>The form is empty. Try submitting an entry!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-inner">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {submissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                            {sub.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                            {sub.subject}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {sub.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            {formatTime(sub.timestamp)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            {sub.updatedAt ? formatTime(sub.updatedAt) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button 
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-orange-500 hover:bg-orange-600 transition"
                                                    onClick={() => startEdit(sub)}
                                                >
                                                    <Pencil className="w-4 h-4 mr-1" />
                                                    Edit
                                                </button>
                                                <button 
                                                    className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-xs font-medium rounded-lg shadow-sm text-blue-700 bg-white hover:bg-blue-50 transition"
                                                    onClick={() => openDetails(sub)}
                                                >
                                                    <Clipboard className="w-4 h-4 mr-1" />
                                                    View
                                                </button>
                                                <button 
                                                    className="p-1.5 text-red-500 rounded-full hover:bg-red-100 transition disabled:opacity-50"
                                                    onClick={() => {
                                                        setSelectedSubmission(sub);
                                                        setIsDetailModalOpen(true); 
                                                    }}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Submission Detail Modal (View and Delete) */}
            <ModalComponent 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                title="Submission Details"
                headerBgClass="bg-blue-50"
                footer={
                    <>
                        <button 
                            className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                            onClick={() => setIsDetailModalOpen(false)}
                        >
                            Close
                        </button>
                        <button 
                            className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center space-x-2 disabled:opacity-50"
                            onClick={() => handleDelete(selectedSubmission.id)} 
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            <span>Delete Submission</span>
                        </button>
                    </>
                }
            >
                {selectedSubmission && (
                    <div className="space-y-4 text-gray-700">
                        <p className="font-semibold">Subject: <span className="font-normal">{selectedSubmission.subject}</span></p>
                        <p className="font-semibold">Name: <span className="font-normal">{selectedSubmission.name}</span></p>
                        <p className="font-semibold">Email: <span className="font-normal">{selectedSubmission.email}</span></p>
                        <p className="font-semibold">Submitted On: <span className="font-normal">{formatTime(selectedSubmission.timestamp)}</span></p>
                        {selectedSubmission.updatedAt && (
                            <p className="font-semibold">Last Updated: <span className="font-normal">{formatTime(selectedSubmission.updatedAt)}</span></p>
                        )}
                        <hr className="my-4" />
                        <p className="font-semibold">Message:</p>
                        <div className="p-4 bg-gray-50 w-full rounded-md border border-gray-200">
                            <p className="whitespace-pre-wrap italic text-gray-700">{selectedSubmission.message}</p>
                        </div>
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-mono bg-gray-100 text-gray-600 rounded">
                            User ID: {selectedSubmission.userId}
                        </span>
                    </div>
                )}
            </ModalComponent>

            {/* Submission Edit Modal (Update) */}
            <ModalComponent 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title={<span className="flex items-center space-x-2 text-orange-600"><Pencil className="w-6 h-6"/>Edit Submission</span>}
                headerBgClass="bg-orange-50"
                footer={
                    <button 
                        className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                        onClick={() => setIsEditModalOpen(false)}
                    >
                        Cancel
                    </button>
                }
            >
                {submissionToEdit && (
                    <SubmissionForm 
                        db={db} 
                        userId={userId} 
                        initialSubmission={submissionToEdit}
                        onClose={() => setIsEditModalOpen(false)} // Close modal upon successful update
                        showToast={showToast}
                    />
                )}
            </ModalComponent>
        </div>
    );
};

// 4. Main Application Component with Navigation
const AppContainer = () => {
    const [toastState, showToast, dismissToast] = useSimpleToast();
    // State to toggle between the two views: 'form' or 'admin'
    const [view, setView] = useState('form');
    
    // Custom hook for Firebase setup
    const { db, userId, isAuthReady } = useFirebase(showToast);

    // Custom hook for real-time data fetching
    const { submissions, isLoading } = useSubmissions(db, isAuthReady, showToast);

    // Show a loading state until Firebase is ready
    if (!isAuthReady) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
                <p className="mt-4 text-lg text-gray-700">Connecting to database and authenticating...</p>
                <p className="mt-2 text-sm text-gray-500">
                    If this persists, check the browser console for Firebase configuration errors.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 font-sans">
            <style>
              {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              `}
            </style>
            
            {/* Header/Navigation */}
            <header className="w-full max-w-7xl p-4 bg-white rounded-xl shadow-lg mb-8">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h1 className="text-xl font-bold text-teal-700 flex items-center space-x-2">
                        <FormInput className="w-6 h-6"/>
                        <span>Submission Manager (Tailwind/Firestore)</span>
                    </h1>
                    <div className="flex space-x-4">
                        <button 
                            className={`py-2 px-4 rounded-lg font-semibold transition ${view === 'form' 
                                ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            onClick={() => setView('form')}
                        >
                            <span className="flex items-center space-x-2">
                                <Mail className="w-5 h-5" />
                                <span>Submit Form</span>
                            </span>
                        </button>
                        <button 
                            className={`py-2 px-4 rounded-lg font-semibold transition ${view === 'admin' 
                                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            onClick={() => setView('admin')}
                        >
                            <span className="flex items-center space-x-2">
                                <PanelTop className="w-5 h-5" />
                                <span>Admin Dashboard</span>
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="w-full flex-1 max-w-7xl">
                {view === 'form' ? (
                    // SubmissionForm in Create Mode
                    <SubmissionForm db={db} userId={userId} showToast={showToast} /> 
                ) : (
                    <AdminDashboard db={db} submissions={submissions} isLoading={isLoading} userId={userId} showToast={showToast} />
                )}
            </main>

            {/* Footer */}
            <footer className="w-full max-w-7xl py-4 mt-8 text-center text-gray-500 text-sm">
                Built with React, Tailwind CSS, and Firestore.
            </footer>

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

// Main Export
export default function App() {
  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <AppContainer />
    </>
  );
}