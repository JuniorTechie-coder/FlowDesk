import { useEffect, useState, useMemo, useCallback } from "react";
import { API_BASE } from "../config";
import { useToast } from "../toast-context";
import { useNavigation } from "../navigation-context";
import {
    Plus,
    Trash2,
    Edit3,
    Crown,
    User,
    Search,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Layers,
    Folder,
    X,
    Filter,
    MoreHorizontal,
    Sparkles,
    MoveVertical
} from "lucide-react";

function matchesFilter(card, filterAssignee, currentUser, searchQuery) {
    if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = card.title && card.title.toLowerCase().includes(q);
        const matchesDesc = card.description && card.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
    }

    if (filterAssignee === "all") return true;
    if (filterAssignee === "unassigned") return !card.assigned_to;
    if (filterAssignee === "my") {
        return currentUser && card.assigned_to === currentUser.user_id;
    }
    return Number(card.assigned_to) === Number(filterAssignee);
}

function BoardDetail({ handleLogout }) {
    const toast = useToast();
    const { navigateTo } = useNavigation();
    const [lists, setLists] = useState([]);
    const [backlogCards, setBacklogCards] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Current logged-in user
    const [currentUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    // Board / Workspace information
    const [board, setBoard] = useState(null);
    const [workspace, setWorkspace] = useState(null);

    // Theme
    const [theme, setTheme] = useState(
        localStorage.getItem("flowdesk_board_theme") || "theme-sunset"
    );

    // Role (lead vs member)
    const [role, setRole] = useState(
        localStorage.getItem("flowdesk_board_role") || "member"
    );

    // Filter cards by assignee ('all' | 'my' | 'unassigned' | number)
    const [filterAssignee, setFilterAssignee] = useState("all");
    const [cardSearchQuery, setCardSearchQuery] = useState("");

    // Drag and Drop
    const [draggedCard, setDraggedCard] = useState(null);
    const [dragOverList, setDragOverList] = useState(null);

    // Inline quick add card for lists
    const [quickAddListId, setQuickAddListId] = useState(null);
    const [quickAddTitle, setQuickAddTitle] = useState("");
    const [submittingQuickAdd, setSubmittingQuickAdd] = useState(false);

    // List modal states
    const [showListModal, setShowListModal] = useState(false);
    const [listName, setListName] = useState("");
    const [creatingList, setCreatingList] = useState(false);

    const [editingListId, setEditingListId] = useState(null);
    const [editingListName, setEditingListName] = useState("");
    const [updatingList, setUpdatingList] = useState(false);

    // Card modal states (advanced add)
    const [showCardModal, setShowCardModal] = useState(false);
    const [selectedListId, setSelectedListId] = useState(null);
    const [cardTitle, setCardTitle] = useState("");
    const [cardDescription, setCardDescription] = useState("");
    const [cardAssignee, setCardAssignee] = useState("");
    const [creatingCard, setCreatingCard] = useState(false);

    // Backlog modal states
    const [showBacklogModal, setShowBacklogModal] = useState(false);
    const [backlogTitle, setBacklogTitle] = useState("");
    const [backlogDescription, setBacklogDescription] = useState("");
    const [backlogAssignee, setBacklogAssignee] = useState("");
    const [creatingBacklogCard, setCreatingBacklogCard] = useState(false);

    // Card Edit state
    const [editingCardId, setEditingCardId] = useState(null);
    const [editingCardTitle, setEditingCardTitle] = useState("");
    const [editingCardDescription, setEditingCardDescription] = useState("");
    const [editingCardAssignee, setEditingCardAssignee] = useState("");
    const [updatingCard, setUpdatingCard] = useState(false);

    const boardId = window.location.pathname.split("/")[2];

    // Theme sync
    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem("flowdesk_board_theme", theme);
        return () => {
            document.body.className = "";
        };
    }, [theme]);

    function changeTheme(newTheme) {
        setTheme(newTheme);
    }

    function changeRole(newRole) {
        setRole(newRole);
        localStorage.setItem("flowdesk_board_role", newRole);
    }

    // Modal close on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowListModal(false);
                setShowCardModal(false);
                setShowBacklogModal(false);
                setEditingCardId(null);
                setEditingListId(null);
                setQuickAddListId(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Card status helper
    function getCardStatus(listName) {
        const name = (listName || "").toLowerCase().trim();
        if (name.includes("done") || name.includes("complete") || name.includes("finish") || name.includes("prod")) {
            return {
                className: "card-status-done",
                label: "Done",
                icon: <CheckCircle2 size={12} />,
            };
        }
        if (name.includes("progress") || name.includes("doing") || name.includes("review") || name.includes("test")) {
            return {
                className: "card-status-progress",
                label: "In Progress",
                icon: <Clock size={12} />,
            };
        }
        return {
            className: "card-status-todo",
            label: "To Do",
            icon: <Sparkles size={12} />,
        };
    }

    // API Calls
    const fetchBoard = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/boards/${boardId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to fetch board");

            setBoard(data);
            if (data.background && data.background.startsWith("theme-")) {
                setTheme(data.background);
            }

            if (data.workspace_id) {
                const workspaceResponse = await fetch(
                    `${API_BASE}/workspaces/${data.workspace_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const workspaceData = await workspaceResponse.json();
                if (workspaceResponse.ok) setWorkspace(workspaceData);
            }
        } catch (error) {
            console.error("Error fetching board:", error);
        }
    }, [boardId]);

    const fetchLists = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/lists/board/${boardId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to fetch lists");

            const listsWithCards = await Promise.all(
                data.map(async (list) => {
                    const cardResponse = await fetch(
                        `${API_BASE}/cards/lists/${list.id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const cards = await cardResponse.json();
                    return {
                        ...list,
                        cards: cardResponse.ok && Array.isArray(cards) ? cards : [],
                    };
                })
            );

            setLists(listsWithCards);
        } catch (error) {
            console.error("Error fetching lists:", error);
        } finally {
            setLoading(false);
        }
    }, [boardId]);

    const fetchBacklog = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${API_BASE}/cards/board/${boardId}/backlog`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setBacklogCards(data);
            } else {
                setBacklogCards([]);
            }
        } catch (error) {
            console.error("Error fetching backlog cards:", error);
        }
    }, [boardId]);

    const fetchTeamMembers = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setTeamMembers(data);
            }
        } catch (error) {
            console.error("Error fetching team members:", error);
        }
    }, []);

    useEffect(() => {
        let active = true;
        async function load() {
            await fetchBoard();
            if (active) await fetchLists();
            if (active) await fetchBacklog();
            if (active) await fetchTeamMembers();
        }
        load();
        return () => {
            active = false;
        };
    }, [fetchBoard, fetchLists, fetchBacklog, fetchTeamMembers]);

    // List CRUD
    async function handleCreateList(e) {
        e.preventDefault();
        if (!listName.trim()) {
            toast.error("List name is required!");
            return;
        }

        try {
            setCreatingList(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/lists`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: listName.trim(),
                    position: lists.length,
                    board_id: Number(boardId),
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to create list");

            setLists((prev) => [...prev, { ...data, cards: [] }]);
            setListName("");
            setShowListModal(false);
            toast.success(`List "${data.name}" added!`);
        } catch (error) {
            console.error("Error creating list:", error);
            toast.error(error.message);
        } finally {
            setCreatingList(false);
        }
    }

    async function handleUpdateList(e) {
        e.preventDefault();
        if (!editingListName.trim()) {
            toast.error("List name is required!");
            return;
        }

        try {
            setUpdatingList(true);
            const token = localStorage.getItem("token");
            const list = lists.find((item) => item.id === editingListId);
            if (!list) return;

            const response = await fetch(`${API_BASE}/lists/${editingListId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: editingListName.trim(),
                    position: list.position,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to update list");

            setLists((prev) =>
                prev.map((item) =>
                    item.id === editingListId
                        ? { ...item, name: editingListName.trim() }
                        : item
                )
            );
            setEditingListId(null);
            setEditingListName("");
            toast.success("List title updated");
        } catch (error) {
            console.error("Error updating list:", error);
            toast.error(error.message);
        } finally {
            setUpdatingList(false);
        }
    }

    async function handleDeleteList(listId) {
        if (!window.confirm("Are you sure you want to delete this list and all its cards?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/lists/${listId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to delete list");
            }

            setLists((prev) => prev.filter((item) => item.id !== listId));
            toast.success("List deleted");
        } catch (error) {
            console.error("Error deleting list:", error);
            toast.error(error.message);
        }
    }

    // Quick Add Card (Inline)
    async function handleQuickAddCard(listId) {
        if (!quickAddTitle.trim()) {
            setQuickAddListId(null);
            return;
        }

        try {
            setSubmittingQuickAdd(true);
            const token = localStorage.getItem("token");
            const targetList = lists.find((l) => l.id === listId);
            if (!targetList) return;

            const response = await fetch(`${API_BASE}/cards`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: quickAddTitle.trim(),
                    position: targetList.cards.length,
                    description: "",
                    list_id: listId,
                    board_id: Number(boardId),
                    is_backlog: false,
                    assigned_to: null,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to create card");

            setLists((prev) =>
                prev.map((l) =>
                    l.id === listId ? { ...l, cards: [...l.cards, data] } : l
                )
            );
            setQuickAddTitle("");
            // Keep quick add open for consecutive additions
        } catch (error) {
            console.error("Error adding quick card:", error);
            toast.error(error.message);
        } finally {
            setSubmittingQuickAdd(false);
        }
    }

    // Full Card Creation (Modal)
    async function handleCreateCard(e) {
        e.preventDefault();
        if (!cardTitle.trim()) {
            toast.error("Card title is required!");
            return;
        }

        try {
            setCreatingCard(true);
            const token = localStorage.getItem("token");
            const selectedList = lists.find((list) => list.id === selectedListId);
            if (!selectedList) throw new Error("List not found");

            const response = await fetch(`${API_BASE}/cards`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: cardTitle.trim(),
                    position: selectedList.cards.length,
                    description: cardDescription.trim(),
                    list_id: selectedListId,
                    board_id: Number(boardId),
                    is_backlog: false,
                    assigned_to: cardAssignee ? Number(cardAssignee) : null,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to create card");

            setLists((prev) =>
                prev.map((list) =>
                    list.id === selectedListId
                        ? { ...list, cards: [...list.cards, data] }
                        : list
                )
            );

            setCardTitle("");
            setCardDescription("");
            setCardAssignee("");
            setSelectedListId(null);
            setShowCardModal(false);
            toast.success("Card created!");
        } catch (error) {
            console.error("Error creating card:", error);
            toast.error(error.message);
        } finally {
            setCreatingCard(false);
        }
    }

    // Backlog Card Creation
    async function handleCreateBacklogCard(e) {
        e.preventDefault();
        if (!backlogTitle.trim()) {
            toast.error("Card title is required!");
            return;
        }

        try {
            setCreatingBacklogCard(true);
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE}/cards`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: backlogTitle.trim(),
                    position: backlogCards.length,
                    description: backlogDescription.trim(),
                    board_id: Number(boardId),
                    is_backlog: true,
                    assigned_to: backlogAssignee ? Number(backlogAssignee) : null,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to create backlog card");

            setBacklogCards((prev) => [...prev, data]);
            setBacklogTitle("");
            setBacklogDescription("");
            setBacklogAssignee("");
            setShowBacklogModal(false);
            toast.success("Task staged in Team Lead Backlog!");
        } catch (error) {
            console.error("Error creating backlog card:", error);
            toast.error(error.message);
        } finally {
            setCreatingBacklogCard(false);
        }
    }

    // Card Assignment
    async function handleAssignCard(cardId, newAssigneeId, e) {
        if (e) e.stopPropagation();

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/cards/${cardId}/assign`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    assigned_to: newAssigneeId ? Number(newAssigneeId) : null,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to assign card");

            const updatedCard = data.card;

            setLists((prev) =>
                prev.map((list) => ({
                    ...list,
                    cards: list.cards.map((card) =>
                        card.id === cardId
                            ? {
                                  ...card,
                                  assigned_to: updatedCard.assigned_to,
                                  assigned_to_name: updatedCard.assigned_to_name,
                                  assigned_to_email: updatedCard.assigned_to_email,
                              }
                            : card
                    ),
                }))
            );

            setBacklogCards((prev) =>
                prev.map((card) =>
                    card.id === cardId
                        ? {
                              ...card,
                              assigned_to: updatedCard.assigned_to,
                              assigned_to_name: updatedCard.assigned_to_name,
                              assigned_to_email: updatedCard.assigned_to_email,
                          }
                        : card
                )
            );

            toast.success("Assignee updated");
        } catch (error) {
            console.error("Error assigning card:", error);
            toast.error(error.message);
        }
    }

    // Edit & Update Card
    function openEditCard(card) {
        setEditingCardId(card.id);
        setEditingCardTitle(card.title || "");
        setEditingCardDescription(card.description || "");
        setEditingCardAssignee(card.assigned_to ? String(card.assigned_to) : "");
    }

    async function handleUpdateCard(e) {
        e.preventDefault();
        if (!editingCardTitle.trim()) {
            toast.error("Card title is required!");
            return;
        }

        try {
            setUpdatingCard(true);
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_BASE}/cards/${editingCardId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: editingCardTitle.trim(),
                    description: editingCardDescription.trim(),
                    assigned_to: editingCardAssignee ? Number(editingCardAssignee) : null,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to update card");

            const updatedCard = data.card;

            setLists((prev) =>
                prev.map((list) => ({
                    ...list,
                    cards: list.cards.map((card) =>
                        card.id === editingCardId
                            ? {
                                  ...card,
                                  title: updatedCard.title,
                                  description: updatedCard.description,
                                  assigned_to: updatedCard.assigned_to,
                                  assigned_to_name: updatedCard.assigned_to_name,
                                  assigned_to_email: updatedCard.assigned_to_email,
                              }
                            : card
                    ),
                }))
            );

            setBacklogCards((prev) =>
                prev.map((card) =>
                    card.id === editingCardId
                        ? {
                              ...card,
                              title: updatedCard.title,
                              description: updatedCard.description,
                              assigned_to: updatedCard.assigned_to,
                              assigned_to_name: updatedCard.assigned_to_name,
                              assigned_to_email: updatedCard.assigned_to_email,
                          }
                        : card
                )
            );

            setEditingCardId(null);
            setEditingCardTitle("");
            setEditingCardDescription("");
            setEditingCardAssignee("");
            toast.success("Card updated");
        } catch (error) {
            console.error("Error updating card:", error);
            toast.error(error.message);
        } finally {
            setUpdatingCard(false);
        }
    }

    // Delete Card
    async function handleDeleteCard(cardId, isBacklog = false) {
        if (!window.confirm("Are you sure you want to delete this card?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE}/cards/${cardId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to delete card");
            }

            if (isBacklog) {
                setBacklogCards((prev) => prev.filter((card) => card.id !== cardId));
            } else {
                setLists((prev) =>
                    prev.map((list) => ({
                        ...list,
                        cards: list.cards.filter((card) => card.id !== cardId),
                    }))
                );
            }
            toast.success("Card deleted");
        } catch (error) {
            console.error("Error deleting card:", error);
            toast.error(error.message);
        }
    }

    // Drag and Drop
    function handleDragStart(card, sourceListId) {
        setDraggedCard({ card, sourceListId });
    }

    function handleDragEnd() {
        setDraggedCard(null);
        setDragOverList(null);
    }

    function handleDragOver(e, listId) {
        e.preventDefault();
        if (dragOverList !== listId) {
            setDragOverList(listId);
        }
    }

    async function handleDrop(targetListId) {
        if (!draggedCard) return;
        const { card, sourceListId } = draggedCard;

        if (sourceListId === targetListId) {
            setDraggedCard(null);
            setDragOverList(null);
            return;
        }

        const token = localStorage.getItem("token");

        // CASE 1: To Backlog
        if (targetListId === "backlog") {
            setLists((prev) =>
                prev.map((list) =>
                    list.id === sourceListId
                        ? { ...list, cards: list.cards.filter((item) => item.id !== card.id) }
                        : list
                )
            );

            const updatedCard = {
                ...card,
                list_id: null,
                is_backlog: true,
                position: backlogCards.length,
            };
            setBacklogCards((prev) => [...prev, updatedCard]);
            setDraggedCard(null);
            setDragOverList(null);

            try {
                await fetch(`${API_BASE}/cards/${card.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: card.title,
                        description: card.description,
                        position: backlogCards.length,
                        list_id: null,
                        board_id: Number(boardId),
                        is_backlog: true,
                    }),
                });
            } catch (err) {
                console.error("Error moving card to backlog:", err);
                fetchLists();
                fetchBacklog();
            }
            return;
        }

        // CASE 2: From Backlog into List
        if (sourceListId === "backlog") {
            const targetList = lists.find((l) => l.id === targetListId);
            if (!targetList) return;

            setBacklogCards((prev) => prev.filter((item) => item.id !== card.id));
            const newPosition = targetList.cards.length;
            const updatedCard = {
                ...card,
                list_id: targetListId,
                is_backlog: false,
                position: newPosition,
            };

            setLists((prev) =>
                prev.map((l) =>
                    l.id === targetListId
                        ? { ...l, cards: [...l.cards, updatedCard] }
                        : l
                )
            );

            setDraggedCard(null);
            setDragOverList(null);

            try {
                await fetch(`${API_BASE}/cards/${card.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: card.title,
                        description: card.description,
                        position: newPosition,
                        list_id: targetListId,
                        board_id: Number(boardId),
                        is_backlog: false,
                    }),
                });
            } catch (err) {
                console.error("Error moving card from backlog:", err);
                fetchLists();
                fetchBacklog();
            }
            return;
        }

        // CASE 3: Between Two Lists
        const sourceList = lists.find((l) => l.id === sourceListId);
        const targetList = lists.find((l) => l.id === targetListId);
        if (!sourceList || !targetList) {
            setDraggedCard(null);
            setDragOverList(null);
            return;
        }

        const updatedSourceCards = sourceList.cards.filter((item) => item.id !== card.id);
        const newPosition = targetList.cards.length;
        const updatedCard = {
            ...card,
            list_id: targetListId,
            position: newPosition,
        };
        const updatedTargetCards = [...targetList.cards, updatedCard];

        setLists((prev) =>
            prev.map((list) => {
                if (list.id === sourceListId) return { ...list, cards: updatedSourceCards };
                if (list.id === targetListId) return { ...list, cards: updatedTargetCards };
                return list;
            })
        );

        setDraggedCard(null);
        setDragOverList(null);

        try {
            await fetch(`${API_BASE}/cards/${card.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: card.title,
                    description: card.description,
                    position: newPosition,
                    list_id: targetListId,
                }),
            });
        } catch (error) {
            console.error("Error moving card:", error);
            fetchLists();
        }
    }

    // Memoized visible cards
    const visibleBacklogCards = useMemo(
        () =>
            backlogCards.filter((card) =>
                matchesFilter(card, filterAssignee, currentUser, cardSearchQuery)
            ),
        [backlogCards, filterAssignee, currentUser, cardSearchQuery]
    );

    const visibleCardsByList = useMemo(() => {
        const map = {};
        for (const list of lists) {
            map[list.id] = [...(list.cards || [])]
                .filter((card) =>
                    matchesFilter(card, filterAssignee, currentUser, cardSearchQuery)
                )
                .sort((a, b) => Number(a.position) - Number(b.position));
        }
        return map;
    }, [lists, filterAssignee, currentUser, cardSearchQuery]);

    // Total stats
    const totalCardsCount = useMemo(() => {
        let count = backlogCards.length;
        for (const l of lists) count += (l.cards || []).length;
        return count;
    }, [lists, backlogCards]);

    // Assignee badge renderer
    function renderAssigneeBadge(card) {
        return (
            <div className="card-assignee-row">
                <div
                    className={`card-assignee-pill ${card.assigned_to ? "assigned" : "unassigned"}`}
                    title={
                        card.assigned_to
                            ? `Assigned to: ${card.assigned_to_name || "User #" + card.assigned_to}`
                            : "Unassigned"
                    }
                >
                    <span className="card-assignee-avatar">
                        {card.assigned_to_name ? (
                            card.assigned_to_name[0].toUpperCase()
                        ) : (
                            <User size={10} />
                        )}
                    </span>
                    <span className="card-assignee-name">
                        {card.assigned_to_name || "Unassigned"}
                    </span>
                </div>

                {role === "lead" && (
                    <select
                        className="card-quick-assign-select"
                        value={card.assigned_to || ""}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleAssignCard(card.id, e.target.value, e)}
                        title="Assign to team member"
                    >
                        <option value="">+ Assign</option>
                        {teamMembers.map((member) => (
                            <option key={member.user_id} value={member.user_id}>
                                {member.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="board-loading-screen">
                <div className="board-loading-navbar">
                    <div className="skeleton-line skeleton-header" style={{ width: "120px" }}></div>
                    <div className="skeleton-line skeleton-header" style={{ width: "200px" }}></div>
                </div>
                <div className="board-loading-lists">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="board-loading-list-col">
                            <div className="skeleton-line skeleton-header" style={{ marginBottom: "16px" }}></div>
                            <div className="board-card-skeleton"></div>
                            <div className="board-card-skeleton"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="board-detail-layout">
            {/* Top Navigation Bar */}
            <header className="board-navbar">
                <div className="board-nav-left">
                    <div
                        className="board-logo"
                        onClick={() => navigateTo("/workspace")}
                        title="Back to Workspaces"
                    >
                        <div className="logo-icon-box">
                            <Layers size={18} color="#fff" />
                        </div>
                        <span className="logo-text">FlowDesk</span>
                    </div>

                    {/* Breadcrumbs */}
                    <nav className="board-breadcrumbs" aria-label="Breadcrumb">
                        <button
                            className="board-breadcrumb-link"
                            onClick={() => navigateTo("/workspace")}
                        >
                            Workspaces
                        </button>
                        <ChevronRight size={14} className="breadcrumb-chevron" />
                        <button
                            className="board-breadcrumb-link"
                            onClick={() =>
                                navigateTo(
                                    board?.workspace_id
                                        ? `/boards/${board.workspace_id}`
                                        : "/workspace"
                                )
                            }
                        >
                            {workspace?.name || "Boards"}
                        </button>
                        <ChevronRight size={14} className="breadcrumb-chevron" />
                        <span className="board-breadcrumb-current">{board?.name || "Board"}</span>
                    </nav>
                </div>

                <div className="board-nav-right">
                    {/* Theme Swatches */}
                    <div className="theme-switcher-box" title="Change board visual atmosphere">
                        <button
                            className={`theme-dot sunset ${theme === "theme-sunset" ? "active" : ""}`}
                            onClick={() => changeTheme("theme-sunset")}
                            title="Sunset Pink"
                        />
                        <button
                            className={`theme-dot ocean ${theme === "theme-ocean" ? "active" : ""}`}
                            onClick={() => changeTheme("theme-ocean")}
                            title="Ocean Blue"
                        />
                        <button
                            className={`theme-dot magenta ${theme === "theme-magenta" ? "active" : ""}`}
                            onClick={() => changeTheme("theme-magenta")}
                            title="Neon Magenta"
                        />
                        <button
                            className={`theme-dot midnight ${theme === "theme-midnight" ? "active" : ""}`}
                            onClick={() => changeTheme("theme-midnight")}
                            title="Midnight Violet"
                        />
                    </div>

                    {/* Role Toggle Switch */}
                    <div className="role-switch-container">
                        <button
                            className={`role-switch-btn ${role === "member" ? "active" : ""}`}
                            onClick={() => changeRole("member")}
                        >
                            <User size={13} />
                            <span>Member</span>
                        </button>
                        <button
                            className={`role-switch-btn lead ${role === "lead" ? "active" : ""}`}
                            onClick={() => changeRole("lead")}
                            title="Team Lead mode stages the backlog & assigns cards"
                        >
                            <Crown size={13} />
                            <span>Team Lead</span>
                        </button>
                    </div>

                    {/* User Profile */}
                    <div
                        className="user-avatar-pill"
                        title={currentUser ? `${currentUser.name} (${currentUser.email})` : "Active User"}
                    >
                        <span className="user-avatar-char">
                            {currentUser?.name ? currentUser.name[0].toUpperCase() : "U"}
                        </span>
                        <span className="user-avatar-label">
                            {currentUser?.name?.split(" ")[0] || "User"}
                        </span>
                    </div>
                </div>
            </header>

            {/* Board Subheader Toolbar */}
            <div className="board-subbar">
                <div className="board-subbar-left">
                    <h1 className="board-active-title">{board?.name || "Project Board"}</h1>

                    {/* Real-time Card Search */}
                    <div className="board-search-box">
                        <Search size={14} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Find cards..."
                            value={cardSearchQuery}
                            onChange={(e) => setCardSearchQuery(e.target.value)}
                        />
                        {cardSearchQuery && (
                            <button
                                className="board-search-clear"
                                onClick={() => setCardSearchQuery("")}
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Assignee Filter Chips */}
                    <div className="board-filters-group">
                        <button
                            className={`board-filter-chip ${filterAssignee === "all" ? "active" : ""}`}
                            onClick={() => setFilterAssignee("all")}
                        >
                            All ({totalCardsCount})
                        </button>
                        <button
                            className={`board-filter-chip ${filterAssignee === "my" ? "active" : ""}`}
                            onClick={() => setFilterAssignee("my")}
                        >
                            <User size={12} />
                            <span>My Cards</span>
                        </button>
                        <button
                            className={`board-filter-chip ${filterAssignee === "unassigned" ? "active" : ""}`}
                            onClick={() => setFilterAssignee("unassigned")}
                        >
                            Unassigned
                        </button>

                        {teamMembers.length > 0 && (
                            <select
                                className="board-member-filter-select"
                                value={filterAssignee}
                                onChange={(e) => setFilterAssignee(e.target.value)}
                            >
                                <option value="all">Member Filter...</option>
                                {teamMembers.map((m) => (
                                    <option key={m.user_id} value={m.user_id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <div className="board-subbar-right">
                    {role === "lead" && (
                        <button
                            className="lead-backlog-trigger-btn"
                            onClick={() => setShowBacklogModal(true)}
                        >
                            <Crown size={14} />
                            <span>Stage Backlog</span>
                        </button>
                    )}

                    <button
                        className="add-list-trigger-btn"
                        onClick={() => setShowListModal(true)}
                    >
                        <Plus size={14} />
                        <span>Add List</span>
                    </button>
                </div>
            </div>

            {/* Main Board View: Kanban Lists + Optional Team Lead Backlog */}
            <div className="board-canvas-area">
                {/* Team Lead Backlog Panel */}
                {role === "lead" && (
                    <aside
                        className={`board-lead-backlog-tray ${dragOverList === "backlog" ? "drop-active" : ""}`}
                        onDragOver={(e) => handleDragOver(e, "backlog")}
                        onDragLeave={() => setDragOverList(null)}
                        onDrop={() => handleDrop("backlog")}
                    >
                        <div className="backlog-tray-header">
                            <div className="backlog-title-row">
                                <Crown size={16} className="crown-icon" />
                                <h3>Team Lead Backlog</h3>
                                <span className="backlog-count-tag">{backlogCards.length}</span>
                            </div>
                            <p className="backlog-instruction">
                                Stage upcoming tasks and assign team members. Drag cards into active lists to deploy.
                            </p>
                            <button
                                className="backlog-add-btn"
                                onClick={() => setShowBacklogModal(true)}
                            >
                                <Plus size={14} />
                                <span>New Task</span>
                            </button>
                        </div>

                        <div className="backlog-card-scroll">
                            {visibleBacklogCards.length === 0 ? (
                                <div className="backlog-empty-msg">
                                    <p>No staged tasks in backlog.</p>
                                    <span>Drag board cards here or click "+ New Task"</span>
                                </div>
                            ) : (
                                visibleBacklogCards.map((card) => (
                                    <div
                                        key={card.id}
                                        className={`kanban-card backlog-task-card ${
                                            draggedCard?.card.id === card.id ? "is-dragged" : ""
                                        }`}
                                        draggable={true}
                                        onDragStart={() => handleDragStart(card, "backlog")}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <div className="card-top-row">
                                            <span className="card-type-chip backlog-chip">
                                                <Crown size={10} />
                                                <span>Backlog</span>
                                            </span>
                                            <div className="card-actions-row">
                                                <button
                                                    className="card-mini-btn"
                                                    onClick={() => openEditCard(card)}
                                                    title="Edit card"
                                                >
                                                    <Edit3 size={12} />
                                                </button>
                                                <button
                                                    className="card-mini-btn delete"
                                                    onClick={() => handleDeleteCard(card.id, true)}
                                                    title="Delete card"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        <h4 className="card-title-text">{card.title}</h4>
                                        {card.description && (
                                            <p className="card-desc-text">{card.description}</p>
                                        )}

                                        {renderAssigneeBadge(card)}

                                        <div className="card-bottom-row">
                                            <span className="card-drag-hint">
                                                Drag to deploy &rarr;
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>
                )}

                {/* Lists Columns Area */}
                <div className="board-lists-scrollview">
                    {lists.length === 0 ? (
                        <div className="board-empty-lists">
                            <Layers size={48} className="empty-lists-icon" />
                            <h3>No lists on this board</h3>
                            <p>Organize your workflow by creating lists like "To Do", "In Progress", and "Done".</p>
                            <button
                                className="primary-btn"
                                onClick={() => setShowListModal(true)}
                            >
                                <Plus size={16} />
                                <span>Create First List</span>
                            </button>
                        </div>
                    ) : (
                        [...lists]
                            .sort((a, b) => Number(a.position) - Number(b.position))
                            .map((list) => {
                                const visibleCards = visibleCardsByList[list.id] || [];
                                const cardStatus = getCardStatus(list.name);
                                const isQuickAdding = quickAddListId === list.id;

                                return (
                                    <div
                                        key={list.id}
                                        className={`kanban-list-column ${
                                            dragOverList === list.id ? "drop-active" : ""
                                        }`}
                                        onDragOver={(e) => handleDragOver(e, list.id)}
                                        onDragLeave={() => setDragOverList(null)}
                                        onDrop={() => handleDrop(list.id)}
                                    >
                                        {/* List Header */}
                                        <div className="list-column-header">
                                            <div className="list-title-wrap">
                                                <h3 className="list-heading-name">{list.name}</h3>
                                                <span className="list-card-counter">
                                                    {visibleCards.length}
                                                </span>
                                            </div>

                                            <div className="list-header-buttons">
                                                <button
                                                    className="list-icon-btn"
                                                    onClick={() => {
                                                        setEditingListId(list.id);
                                                        setEditingListName(list.name);
                                                    }}
                                                    title="Edit list title"
                                                >
                                                    <Edit3 size={13} />
                                                </button>
                                                <button
                                                    className="list-icon-btn delete"
                                                    onClick={() => handleDeleteList(list.id)}
                                                    title="Delete list"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Cards Container */}
                                        <div className="list-cards-wrap">
                                            {visibleCards.map((card) => (
                                                <div
                                                    key={card.id}
                                                    className={`kanban-card ${cardStatus.className} ${
                                                        draggedCard?.card.id === card.id
                                                            ? "is-dragged"
                                                            : ""
                                                    }`}
                                                    draggable={true}
                                                    onDragStart={() => handleDragStart(card, list.id)}
                                                    onDragEnd={handleDragEnd}
                                                >
                                                    <div className="card-top-row">
                                                        <span className="card-type-chip status-chip">
                                                            {cardStatus.icon}
                                                            <span>{cardStatus.label}</span>
                                                        </span>
                                                        <div className="card-actions-row">
                                                            <button
                                                                className="card-mini-btn"
                                                                onClick={() => openEditCard(card)}
                                                                title="Edit card"
                                                            >
                                                                <Edit3 size={12} />
                                                            </button>
                                                            <button
                                                                className="card-mini-btn delete"
                                                                onClick={() =>
                                                                    handleDeleteCard(card.id, false)
                                                                }
                                                                title="Delete card"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <h4 className="card-title-text">{card.title}</h4>
                                                    {card.description && (
                                                        <p className="card-desc-text">
                                                            {card.description}
                                                        </p>
                                                    )}

                                                    {renderAssigneeBadge(card)}
                                                </div>
                                            ))}

                                            {/* Quick Add Inline Card Form */}
                                            {isQuickAdding && (
                                                <div className="inline-quick-add-card">
                                                    <textarea
                                                        rows={2}
                                                        placeholder="Enter card title..."
                                                        value={quickAddTitle}
                                                        onChange={(e) =>
                                                            setQuickAddTitle(e.target.value)
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" && !e.shiftKey) {
                                                                e.preventDefault();
                                                                handleQuickAddCard(list.id);
                                                            } else if (e.key === "Escape") {
                                                                setQuickAddListId(null);
                                                                setQuickAddTitle("");
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                    <div className="inline-quick-actions">
                                                        <button
                                                            className="primary-btn sm"
                                                            onClick={() => handleQuickAddCard(list.id)}
                                                            disabled={
                                                                submittingQuickAdd ||
                                                                !quickAddTitle.trim()
                                                            }
                                                        >
                                                            {submittingQuickAdd ? "Adding..." : "Add Card"}
                                                        </button>
                                                        <button
                                                            className="ghost-btn sm"
                                                            onClick={() => {
                                                                setQuickAddListId(null);
                                                                setQuickAddTitle("");
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Add Card Button */}
                                        {!isQuickAdding && (
                                            <div className="list-footer-bar">
                                                <button
                                                    className="list-quick-add-btn"
                                                    onClick={() => {
                                                        setQuickAddListId(list.id);
                                                        setQuickAddTitle("");
                                                    }}
                                                >
                                                    <Plus size={14} />
                                                    <span>Add a card</span>
                                                </button>
                                                <button
                                                    className="list-full-modal-btn"
                                                    title="Add card with full description"
                                                    onClick={() => {
                                                        setSelectedListId(list.id);
                                                        setShowCardModal(true);
                                                    }}
                                                >
                                                    <MoreHorizontal size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                    )}

                    {/* Add Another List Column Tile */}
                    <div className="new-list-column-wrapper">
                        <button
                            className="create-list-column-btn"
                            onClick={() => setShowListModal(true)}
                        >
                            <Plus size={16} />
                            <span>Add another list</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* CREATE LIST MODAL */}
            {showListModal && (
                <div className="modal-overlay" onClick={() => setShowListModal(false)}>
                    <div
                        className="modal-box"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="createListTitle"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-box-header">
                            <div>
                                <h2 id="createListTitle">Add List</h2>
                                <p>Create a stage column on this board.</p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowListModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreateList} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="newListName">List Name *</label>
                                <input
                                    id="newListName"
                                    type="text"
                                    placeholder="e.g. In Review, QA Testing, Done"
                                    value={listName}
                                    onChange={(e) => setListName(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="modal-box-actions">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setShowListModal(false)}
                                    disabled={creatingList}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={creatingList || !listName.trim()}
                                >
                                    {creatingList ? "Adding..." : "Add List"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT LIST MODAL */}
            {editingListId && (
                <div className="modal-overlay" onClick={() => setEditingListId(null)}>
                    <div
                        className="modal-box"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="editListTitle"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-box-header">
                            <div>
                                <h2 id="editListTitle">Edit List</h2>
                                <p>Rename this column.</p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setEditingListId(null)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleUpdateList} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="editListName">List Name *</label>
                                <input
                                    id="editListName"
                                    type="text"
                                    value={editingListName}
                                    onChange={(e) => setEditingListName(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="modal-box-actions">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setEditingListId(null)}
                                    disabled={updatingList}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={updatingList || !editingListName.trim()}
                                >
                                    {updatingList ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE CARD MODAL (Detailed) */}
            {showCardModal && (
                <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
                    <div
                        className="modal-box"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="createCardTitle"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-box-header">
                            <div>
                                <h2 id="createCardTitle">New Task Card</h2>
                                <p>Add a detailed card with notes and an assignee.</p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowCardModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreateCard} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="cardTitleInput">Card Title *</label>
                                <input
                                    id="cardTitleInput"
                                    type="text"
                                    placeholder="What needs to be done?"
                                    value={cardTitle}
                                    onChange={(e) => setCardTitle(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="cardDescInput">Description / Details</label>
                                <textarea
                                    id="cardDescInput"
                                    rows={3}
                                    placeholder="Add context, acceptance criteria, or links..."
                                    value={cardDescription}
                                    onChange={(e) => setCardDescription(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="cardAssigneeInput">Assign Member</label>
                                <select
                                    id="cardAssigneeInput"
                                    value={cardAssignee}
                                    onChange={(e) => setCardAssignee(e.target.value)}
                                >
                                    <option value="">Unassigned</option>
                                    {teamMembers.map((m) => (
                                        <option key={m.user_id} value={m.user_id}>
                                            {m.name} ({m.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-box-actions">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setShowCardModal(false)}
                                    disabled={creatingCard}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={creatingCard || !cardTitle.trim()}
                                >
                                    {creatingCard ? "Creating..." : "Create Card"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE BACKLOG CARD MODAL */}
            {showBacklogModal && (
                <div className="modal-overlay" onClick={() => setShowBacklogModal(false)}>
                    <div
                        className="modal-box"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="createBacklogTitle"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-box-header">
                            <div>
                                <h2 id="createBacklogTitle">👑 Stage Team Lead Backlog Task</h2>
                                <p>Pre-stage work in the backlog for assignment before sprint execution.</p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowBacklogModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreateBacklogCard} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="backlogTitleInput">Task Title *</label>
                                <input
                                    id="backlogTitleInput"
                                    type="text"
                                    placeholder="e.g. Implement OAuth Flow, Set Up Redis Cache"
                                    value={backlogTitle}
                                    onChange={(e) => setBacklogTitle(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="backlogDescInput">Task Details</label>
                                <textarea
                                    id="backlogDescInput"
                                    rows={3}
                                    placeholder="Add acceptance criteria or technical notes..."
                                    value={backlogDescription}
                                    onChange={(e) => setBacklogDescription(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="backlogAssigneeInput">Assign Member</label>
                                <select
                                    id="backlogAssigneeInput"
                                    value={backlogAssignee}
                                    onChange={(e) => setBacklogAssignee(e.target.value)}
                                >
                                    <option value="">Unassigned</option>
                                    {teamMembers.map((m) => (
                                        <option key={m.user_id} value={m.user_id}>
                                            {m.name} ({m.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-box-actions">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setShowBacklogModal(false)}
                                    disabled={creatingBacklogCard}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={creatingBacklogCard || !backlogTitle.trim()}
                                >
                                    {creatingBacklogCard ? "Staging..." : "Stage Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT CARD MODAL */}
            {editingCardId && (
                <div className="modal-overlay" onClick={() => setEditingCardId(null)}>
                    <div
                        className="modal-box"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="editCardTitle"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-box-header">
                            <div>
                                <h2 id="editCardTitle">Edit Task Details</h2>
                                <p>Update title, notes, and team assignment.</p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={() => setEditingCardId(null)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleUpdateCard} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="editCardTitleInput">Card Title *</label>
                                <input
                                    id="editCardTitleInput"
                                    type="text"
                                    value={editingCardTitle}
                                    onChange={(e) => setEditingCardTitle(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editCardDescInput">Description</label>
                                <textarea
                                    id="editCardDescInput"
                                    rows={4}
                                    value={editingCardDescription}
                                    onChange={(e) => setEditingCardDescription(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editCardAssigneeInput">Assigned Member</label>
                                <select
                                    id="editCardAssigneeInput"
                                    value={editingCardAssignee}
                                    onChange={(e) => setEditingCardAssignee(e.target.value)}
                                >
                                    <option value="">Unassigned</option>
                                    {teamMembers.map((m) => (
                                        <option key={m.user_id} value={m.user_id}>
                                            {m.name} ({m.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-box-actions">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setEditingCardId(null)}
                                    disabled={updatingCard}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={updatingCard || !editingCardTitle.trim()}
                                >
                                    {updatingCard ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BoardDetail;
