import React, { useState, useEffect } from "react";
import { Clock, AlertCircle, ChevronDown, Search } from "lucide-react";
import { getRequest } from "@/services/apiRequest";
import TicketDetail from "./TicketDetail";
import { useTranslation } from "react-i18next";

interface Ticket {
    id: string;
    subject: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "open" | "in_progress" | "resolved" | "closed";
    created_at: string;
    updated_at: string;
}

const MyTickets: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    
    const { t } = useTranslation();
    
    // Fetch tickets from API
    useEffect(() => {
        const fetchTickets = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const response = await getRequest('/support/my-tickets');
                // Type assertion for the response
                setTickets((response as any).data);
            } catch (err) {
                setError(t("FailedToLoadTickets"));
                console.error("Error fetching tickets:", err);
                
                // Fallback to sample data for development
                setTickets([
                    {
                        id: "ticket-001",
                        subject: "Payment Issue",
                        description: "I'm having trouble processing my payment for the premium plan. The transaction keeps failing with error code 4032.",
                        priority: "high",
                        status: "open",
                        created_at: "2025-06-20T14:30:00Z",
                        updated_at: "2025-06-20T14:30:00Z"
                    },
                    {
                        id: "ticket-002",
                        subject: "Feature Request",
                        description: "Would it be possible to add a dark mode to the dashboard? It would help reduce eye strain during night sessions.",
                        priority: "low",
                        status: "in_progress",
                        created_at: "2025-06-18T09:15:00Z",
                        updated_at: "2025-06-19T11:45:00Z"
                    },
                    {
                        id: "ticket-003",
                        subject: "Account Access Problem",
                        description: "I can't access my account after changing my email address. I've tried resetting my password but I'm not receiving the reset email.",
                        priority: "medium",
                        status: "resolved",
                        created_at: "2025-06-15T16:20:00Z",
                        updated_at: "2025-06-17T10:30:00Z"
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchTickets();
    }, []);
    
    // View ticket details
    const viewTicketDetails = (ticketId: string) => {
        setSelectedTicketId(ticketId);
    };
    
    // Go back to ticket list
    const goBackToList = () => {
        setSelectedTicketId(null);
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
    
    // Get status badge based on ticket status
    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'open':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">{t("Status_Open")}</span>;
            case 'in_progress':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">{t("Status_InProgress")}</span>;
            case 'resolved':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">{t("Status_Resolved")}</span>;
            case 'closed':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">{t("Status_Closed")}</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">{status}</span>;
        }
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
    
    // Filter tickets based on search query and status filter
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    return (
        <>
            {selectedTicketId ? (
                <TicketDetail ticketId={selectedTicketId} onBack={goBackToList} />
            ) : (
                <div className="max-w-4xl mx-auto bg-[#1a1a20] border border-[#3a3a45] rounded-xl p-6 shadow-lg">
                    <h1 className="text-2xl font-bold text-white mb-6">{t("MySupportTickets")}</h1>
            
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        className="bg-[#252530] border border-[#3a3a45] text-white text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t("SearchTicketsPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="w-full md:w-48">
                    <select
                        className="bg-[#252530] border border-[#3a3a45] text-white text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">{t("AllStatus")}</option>
                        <option value="open">{t("Status_Open")}</option>
                        <option value="in_progress">{t("Status_InProgress")}</option>
                        <option value="resolved">{t("Status_Resolved")}</option>
                        <option value="closed">{t("Status_Closed")}</option>
                    </select>
                </div>
            </div>
            
            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
            
            {/* Error State */}
            {error && !isLoading && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                    <p>{error}</p>
                </div>
            )}
            
            {/* No Tickets State */}
            {!isLoading && !error && filteredTickets.length === 0 && (
                <div className="text-center py-10">
                    <div className="mx-auto w-16 h-16 bg-[#252530] rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">{t("NoTicketsFound")}</h3>
                    <p className="text-gray-400">
                        {searchQuery || statusFilter !== 'all' 
                            ? t("TryAdjustingSearchOrFilter")
                            : t("NoTicketsYet")}
                    </p>
                </div>
            )}
            
            {/* Tickets List */}
            {!isLoading && !error && filteredTickets.length > 0 && (
                <div className="space-y-4">
                    {filteredTickets.map(ticket => (
                        <div 
                            key={ticket.id} 
                            className="border border-[#3a3a45] rounded-lg overflow-hidden bg-[#252530]"
                        >
                            {/* Ticket Header - Now clickable to view details */}
                            <div 
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#2a2a35]"
                                onClick={() => viewTicketDetails(ticket.id)}
                            >
                                <div className="flex items-center space-x-3">
                                    {getPriorityIcon(ticket.priority)}
                                    <div>
                                        <h3 className="text-white font-medium">{ticket.subject}</h3>
                                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                                            <span>#{ticket.id}</span>
                                            <span>•</span>
                                            <span>{formatDate(ticket.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {getStatusBadge(ticket.status)}
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
                </div>
            )}
        </>
    );
};

export default MyTickets;