import React, { useState, useEffect } from "react";
import { ArrowLeft, Send, Clock, AlertCircle } from "lucide-react";
import { getRequest, postRequest } from "@/services/apiRequest";

interface Reply {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  is_internal_note: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
  [key: string]: any;
}

interface TicketDetailProps {
  ticketId: string;
  onBack: () => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, onBack }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch ticket details and replies
  useEffect(() => {
    const fetchTicketDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First try to get the specific ticket details
        try {
          const ticketResponse = await getRequest(`/support/tickets/${ticketId}`) as ApiResponse<Ticket>;
          console.log('Ticket response:', ticketResponse);
          
          if (ticketResponse && ticketResponse.data) {
            setTicket(ticketResponse.data);
          }
        } catch (ticketError) {
          console.error('Error fetching specific ticket, falling back to my-tickets:', ticketError);
          
          // Fallback: try to find the ticket in the user's tickets list
          const myTicketsResponse = await getRequest('/support/my-tickets') as ApiResponse<Ticket[]>;
          console.log('My tickets response:', myTicketsResponse);
          
          if (myTicketsResponse && myTicketsResponse.data) {
            const foundTicket = myTicketsResponse.data.find(t => t.id === parseInt(ticketId));
            if (foundTicket) {
              setTicket(foundTicket);
            } else {
              throw new Error('Ticket not found in user tickets');
            }
          } else {
            throw new Error('Invalid ticket response format');
          }
        }
        
        // Fetch ticket replies
        try {
          const repliesResponse = await getRequest(`/support/tickets/${ticketId}/replies`) as ApiResponse<Reply[]>;
          console.log('Replies response:', repliesResponse);
          
          if (repliesResponse && Array.isArray(repliesResponse)) {
            // Direct array response
            setReplies(repliesResponse);
          } else if (repliesResponse && repliesResponse.data) {
            // Response with data property
            setReplies(repliesResponse.data);
          } else {
            // If no replies or invalid format, set empty array
            setReplies([]);
          }
        } catch (repliesError) {
          console.error('Error fetching replies:', repliesError);
          setReplies([]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching ticket details:", err);
        setError("Failed to load ticket details. Please try again.");
        setIsLoading(false);
        
        // Fallback to sample data for development/testing
        if (process.env.NODE_ENV === 'development') {
          console.log('Using fallback sample data for development');
          setTicket({
            id: parseInt(ticketId),
            user_id: 1, // Sample user ID
            subject: "Sample Ticket Subject",
            description: "This is a sample ticket description for development purposes.",
            priority: "medium",
            status: "open",
            created_at: "2025-07-25T10:30:00Z",
            updated_at: "2025-07-25T10:30:00Z"
          });
          
          setReplies([
            {
              id: 1,
              ticket_id: parseInt(ticketId),
              user_id: 2, // Admin user ID
              message: "Thank you for reaching out. We're looking into this issue.",
              created_at: "2025-07-25T11:15:00Z",
              updated_at: "2025-07-25T11:15:00Z",
              is_internal_note: false,
              user: {
                id: 2,
                name: "Support Team",
                email: "support@aisita.ai"
              }
            },
            {
              id: 2,
              ticket_id: parseInt(ticketId),
              user_id: 1, // User's ID
              message: "I'm still experiencing the same problem. Any updates?",
              created_at: "2025-07-26T09:30:00Z",
              updated_at: "2025-07-26T09:30:00Z",
              is_internal_note: false
            }
          ]);
          setIsLoading(false);
        }
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  // Handle submitting a new reply
  const handleSubmitReply = async () => {
    if (!newReply.trim()) return;
    
    setIsSending(true);
    
    try {
      // Send the reply to the API - using the correct endpoint and parameter name
      const response = await postRequest(`/support/tickets/${ticketId}/replies`, {
        message: newReply
      }) as ApiResponse<Reply>;
      
      console.log('Reply response:', response);
      
      if (response && response.data) {
        // If the API returns the new reply object, use it
        setReplies([...replies, response.data]);
      } else {
        // Otherwise create a client-side reply object
        const newReplyObj: Reply = {
          id: Date.now(),
          ticket_id: parseInt(ticketId),
          user_id: ticket?.user_id || 1,
          message: newReply,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_internal_note: false
        };
        
        setReplies([...replies, newReplyObj]);
      }
      
      setNewReply("");
    } catch (err) {
      console.error("Error sending reply:", err);
      setError("Failed to send reply. Please try again.");
      
      // For development/testing, still add the reply locally
      if (process.env.NODE_ENV === 'development') {
        const newReplyObj: Reply = {
          id: Date.now(),
          ticket_id: parseInt(ticketId),
          user_id: ticket?.user_id || 1,
          message: newReply,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_internal_note: false
        };
        
        setReplies([...replies, newReplyObj]);
        setNewReply("");
      }
    } finally {
      setIsSending(false);
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get priority icon based on ticket priority
  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <AlertCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get status badge based on ticket status
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">Open</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">In Progress</span>;
      case 'resolved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">Resolved</span>;
      case 'closed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">Closed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#0b0b0e] border border-[#3a2a15] rounded-xl p-6 shadow-lg">
      {/* Back button and header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-[#252530] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-white">Ticket Details</h1>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Ticket details */}
      {!isLoading && ticket && (
        <>
          <div className="mb-6 border border-[#3a2a15] rounded-lg p-4 bg-[#252530]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">{ticket.subject}</h2>
              {getStatusBadge(ticket.status)}
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
              <p className="text-white whitespace-pre-wrap">{ticket.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="text-gray-400 font-medium mb-1">Priority</h3>
                <div className="flex items-center space-x-1">
                  {getPriorityIcon(ticket.priority)}
                  <span className="text-white capitalize">{ticket.priority}</span>
                </div>
              </div>
              <div>
                <h3 className="text-gray-400 font-medium mb-1">Created</h3>
                <p className="text-white">{formatDate(ticket.created_at)}</p>
              </div>
              <div>
                <h3 className="text-gray-400 font-medium mb-1">Last Updated</h3>
                <p className="text-white">{formatDate(ticket.updated_at)}</p>
              </div>
            </div>
          </div>
          
          {/* Replies section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Conversation</h2>
            
            {replies.length === 0 ? (
              <div className="text-center py-6 bg-[#252530] rounded-lg border border-[#3a2a15]">
                <Clock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No replies yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {replies.map(reply => (
                  <div 
                    key={reply.id}
                    className={`p-4 rounded-lg ${
                      reply.user_id !== ticket?.user_id 
                        ? "bg-[#2a2a35] border border-[#3a2a15] ml-4 mr-0" 
                        : "bg-[#1e3a8a] border border-[#2563eb]/30 ml-0 mr-4"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-white">
                        {reply.user ? reply.user.name : "You"}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(reply.created_at)}</span>
                    </div>
                    <p className="text-white whitespace-pre-wrap">{reply.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Reply form */}
          {ticket.status !== 'closed' && (
            <div className="border border-[#3a2a15] rounded-lg p-4 bg-[#252530]">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Add Reply</h3>
              <div className="flex flex-col space-y-3">
                <textarea
                  className="w-full bg-[#1a1a25] border border-[#3a2a15] rounded-lg p-3 text-white resize-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Type your reply here..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  disabled={isSending}
                ></textarea>
                <div className="flex justify-end">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handleSubmitReply}
                    disabled={!newReply.trim() || isSending}
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TicketDetail;
