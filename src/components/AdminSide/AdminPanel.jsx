import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import app from '../../Firebase';

const AdminPanel = () => {
  const firestore = getFirestore(app);
  const [pendingKYC, setPendingKYC] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const signalingSocketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    const fetchPendingKYC = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'kyc'));
        const pending = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPendingKYC(pending);
      } catch (err) {
        setError('Error fetching KYC requests: ' + err.message);
      }
    };

    fetchPendingKYC();
    
    return () => cleanup();
  }, [firestore]);

  const cleanup = () => {
    if (signalingSocketRef.current?.readyState === WebSocket.OPEN) {
      signalingSocketRef.current.close();
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    setSelectedUser(null);
    setConnectionStatus('disconnected');
  };

  const handleSignalingMessage = async (event) => {
    const data = JSON.parse(event.data);
    
    try {
      switch (data.type) {
        case 'ready':
          console.log('Both parties connected, ready for call');
          break;
          
        case 'offer':
          await handleIncomingOffer(data.offer);
          break;
          
        case 'answer':
          if (peerConnectionRef.current && data.answer) {
            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
          }
          break;
          
        case 'candidate':
          if (peerConnectionRef.current && data.candidate) {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          }
          break;
          
        case 'disconnected':
          handlePeerDisconnection(data.role);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (err) {
      setError('Error handling WebRTC signal: ' + err.message);
    }
  };

  const setupPeerConnection = async () => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && signalingSocketRef.current?.readyState === WebSocket.OPEN) {
        signalingSocketRef.current.send(JSON.stringify({
          type: 'candidate',
          candidate: event.candidate
        }));
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', peerConnection.iceConnectionState);
      setConnectionStatus(peerConnection.iceConnectionState);
    };

    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return peerConnection;
  };

  const handleStartCall = async (user) => {
    try {
      setLoading(true);
      setSelectedUser(user);
      setError(null);


      const socket = new WebSocket('ws://localhost:3000');
      signalingSocketRef.current = socket;

      socket.onopen = () => {
        setConnectionStatus('connected');
        socket.send(JSON.stringify({
          type: 'register',
          role: 'admin',
          sessionId: user.id
        }));
      };

      socket.onmessage = handleSignalingMessage;
      socket.onclose = () => {
        setConnectionStatus('disconnected');
        cleanup();
      };

      // Set up local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = await setupPeerConnection();
      
      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      setLoading(false);
    } catch (err) {
      setError('Failed to start call: ' + err.message);
      setLoading(false);
      cleanup();
    }
  };

  const handleIncomingOffer = async (offer) => {
    try {
      const peerConnection = await setupPeerConnection();
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      signalingSocketRef.current.send(JSON.stringify({
        type: 'answer',
        answer: answer
      }));
    } catch (err) {
      setError('Error handling offer: ' + err.message);
    }
  };

  const handlePeerDisconnection = (role) => {
    setError(`${role === 'client' ? 'Client' : 'Admin'} disconnected`);
    cleanup();
  };

  const handleKYCAction = async (id, status) => {
    try {
      const kycRef = doc(firestore, 'kyc', id);
      await updateDoc(kycRef, {
        status: status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'admin', // You might want to use actual admin ID here
        comments: status === 'rejected' ? 'KYC verification rejected' : 'KYC verification approved'
      });

      // Update local state
      setPendingKYC((prev) => 
        prev.map((item) => 
          item.id === id ? { ...item, status } : item
        )
      );

      // Optional: Remove from pending list after action
      setPendingKYC((prev) => prev.filter((item) => item.id !== id));

      // Show success message
      setError(null);
    } catch (err) {
      setError(`Error ${status === 'approved' ? 'approving' : 'rejecting'} KYC: ${err.message}`);
    }
  };

  const handleDeleteKYC = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'kyc', id));
      setPendingKYC((prev) => prev.filter((item) => item.id !== id));
      setError(null);
    } catch (err) {
      setError('Error deleting KYC record: ' + err.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel - KYC Verification</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <span className={`px-2 py-1 rounded ${
          connectionStatus === 'connected' ? 'bg-green-500 text-white' :
          connectionStatus === 'connecting' ? 'bg-yellow-500 text-white' :
          'bg-red-500 text-white'
        }`}>
          {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
        </span>
      </div>

      {pendingKYC.length === 0 ? (
        <p className="text-gray-600">No pending KYC requests.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            {pendingKYC.map((user) => (
              <div key={user.id} className="bg-white shadow rounded-lg p-4">
                <div className="mb-3">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Slot:</strong> {user.slot.date} at {user.slot.time}</p>
                  <p className="mt-2">
                    <span className={`inline-block px-2 py-1 rounded text-sm ${getStatusBadgeClass(user.status)}`}>
                      {user.status || 'pending'}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`flex-1 py-2 px-4 rounded ${
                      selectedUser?.id === user.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white transition-colors`}
                    onClick={() => handleStartCall(user)}
                    disabled={loading || selectedUser?.id === user.id}
                  >
                    {loading && selectedUser?.id === user.id ? "Connecting..." : "Start Call"}
                  </button>
                  <button
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                    onClick={() => handleKYCAction(user.id, 'approved')}
                  >
                    Approve
                  </button>
                  <button
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
                    onClick={() => handleKYCAction(user.id, 'rejected')}
                  >
                    Reject
                  </button>
                  <button
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                    onClick={() => handleDeleteKYC(user.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {selectedUser && (
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Video Call with {selectedUser.email}</h2>
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-48 bg-gray-200 rounded"
                  />
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-sm rounded">
                    You (Admin)
                  </span>
                </div>
                <div className="relative">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-48 bg-gray-200 rounded"
                  />
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-sm rounded">
                    Client
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;