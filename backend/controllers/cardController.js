const pool = require('../db');

// Logic to get all cards in a list (by list id)
const getListsCards = async (req, res) => {
    try {
        const listId = req.params.id;

        const listResult = await pool.query(
            `SELECT lists.*, boards.workspace_id
             FROM lists
             JOIN boards ON lists.board_id = boards.id
             JOIN workspaces ON boards.workspace_id = workspaces.id
             WHERE lists.id = $1
             AND workspaces.owner_id = $2`,
            [listId, req.user.user_id]
        );

        if (listResult.rows.length === 0) {
            return res.status(404).json({
                error: 'List does not exist or you are not authorized!'
            });
        }

        // Get cards belonging to this list (excluding backlog cards)
        const cardResult = await pool.query(
            `SELECT cards.*, users.name AS assigned_to_name, users.email AS assigned_to_email
             FROM cards
             LEFT JOIN users ON cards.assigned_to = users.user_id
             WHERE cards.list_id = $1
             AND (cards.is_backlog = FALSE OR cards.is_backlog IS NULL)
             ORDER BY cards.position ASC`,
            [listId]
        );

        res.status(200).json(cardResult.rows);

    } catch (error) {
        console.error("Error fetching list cards:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};

// Logic to get all backlog cards for a board (by board id)
const getBoardBacklog = async (req, res) => {
    try {
        const boardId = req.params.boardId;

        const boardResult = await pool.query(
            `SELECT boards.*
             FROM boards
             JOIN workspaces ON boards.workspace_id = workspaces.id
             WHERE boards.id = $1
             AND workspaces.owner_id = $2`,
            [boardId, req.user.user_id]
        );

        if (boardResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Board does not exist or you are not authorized!'
            });
        }

        const backlogResult = await pool.query(
            `SELECT cards.*, users.name AS assigned_to_name, users.email AS assigned_to_email
             FROM cards
             LEFT JOIN users ON cards.assigned_to = users.user_id
             WHERE cards.board_id = $1
             AND cards.is_backlog = TRUE
             ORDER BY cards.position ASC`,
            [boardId]
        );

        res.status(200).json(backlogResult.rows);

    } catch (error) {
        console.error("Error fetching board backlog:", error);
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        });
    }
};

// Logic to get one card by its id 
const getCards = async (req, res) => {
    try {
        const cardsId = req.params.id;

        const cardIdResult = await pool.query(
            `SELECT cards.*, users.name AS assigned_to_name, users.email AS assigned_to_email
             FROM cards
             LEFT JOIN lists ON cards.list_id = lists.id
             LEFT JOIN boards ON (cards.board_id = boards.id OR lists.board_id = boards.id)
             JOIN workspaces ON boards.workspace_id = workspaces.id
             LEFT JOIN users ON cards.assigned_to = users.user_id
             WHERE cards.id = $1
             AND workspaces.owner_id = $2`,
            [cardsId, req.user.user_id]
        );

        if (cardIdResult.rows.length === 0) {
            return res.status(404).json({ error: 'Card does not exist or you are not authorized!' });
        }

        res.status(200).json(cardIdResult.rows[0]);

    } catch (error) {
        console.error("Error fetching card:", error);
        res.status(500).json({ error: 'error occurred in server!' });
    }
};

// Logic to create new cards (supports standard list cards or Team Lead backlog cards)
const addCards = async (req, res) => {
    try {
        const {
            title,
            position = 0,
            description = '',
            list_id = null,
            board_id = null,
            is_backlog = false,
            assigned_to = null
        } = req.body;

        if (!title || (!list_id && !board_id && !is_backlog)) {
            return res.status(400).json({
                error: 'Title and either list_id or board_id are required!'
            });
        }

        let resolvedBoardId = board_id;
        let resolvedListId = list_id;

        if (is_backlog) {
            resolvedListId = null;
            if (!resolvedBoardId) {
                return res.status(400).json({
                    error: 'board_id is required for backlog cards!'
                });
            }

            // Check board ownership
            const boardResult = await pool.query(
                `SELECT boards.*
                 FROM boards
                 JOIN workspaces ON boards.workspace_id = workspaces.id
                 WHERE boards.id = $1
                 AND workspaces.owner_id = $2`,
                [resolvedBoardId, req.user.user_id]
            );

            if (boardResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Board does not exist or you are not authorized!'
                });
            }
        } else {
            // Check list ownership
            const listResult = await pool.query(
                `SELECT lists.*, boards.id AS resolved_board_id
                 FROM lists
                 JOIN boards ON lists.board_id = boards.id
                 JOIN workspaces ON boards.workspace_id = workspaces.id
                 WHERE lists.id = $1
                 AND workspaces.owner_id = $2`,
                [resolvedListId, req.user.user_id]
            );

            if (listResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'List does not exist or you are not authorized!'
                });
            }

            resolvedBoardId = listResult.rows[0].resolved_board_id;
        }

        const resultCards = await pool.query(
            `INSERT INTO cards
             (title, position, description, list_id, board_id, is_backlog, assigned_to, created_by)
             VALUES($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                title,
                position,
                description,
                resolvedListId,
                resolvedBoardId,
                Boolean(is_backlog),
                assigned_to ? parseInt(assigned_to) : null,
                req.user.user_id
            ]
        );

        const newCard = resultCards.rows[0];

        // Fetch assignee details if assigned
        let assigneeName = null;
        let assigneeEmail = null;
        if (newCard.assigned_to) {
            const userRes = await pool.query(
                `SELECT name, email FROM users WHERE user_id = $1`,
                [newCard.assigned_to]
            );
            if (userRes.rows.length > 0) {
                assigneeName = userRes.rows[0].name;
                assigneeEmail = userRes.rows[0].email;
            }
        }

        res.status(201).json({
            ...newCard,
            assigned_to_name: assigneeName,
            assigned_to_email: assigneeEmail
        });

    } catch (error) {
        console.error("Error creating card:", error);
        res.status(500).json({
            error: 'Server error: ' + error.message
        });
    }
};

// Logic to update/edit existing cards
const updateCards = async (req, res) => {
    try {
        const {
            title,
            description,
            position,
            list_id,
            board_id,
            is_backlog,
            assigned_to
        } = req.body;
        const id = req.params.id;

        // Check that the card belongs to the logged-in user's workspace
        const cardResult = await pool.query(
            `SELECT cards.*, COALESCE(cards.board_id, lists.board_id) AS current_board_id
             FROM cards
             LEFT JOIN lists ON cards.list_id = lists.id
             LEFT JOIN boards ON (cards.board_id = boards.id OR lists.board_id = boards.id)
             JOIN workspaces ON boards.workspace_id = workspaces.id
             WHERE cards.id = $1
             AND workspaces.owner_id = $2`,
            [id, req.user.user_id]
        );

        if (cardResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Card does not exist or you are not authorized!'
            });
        }

        const currentCard = cardResult.rows[0];

        let targetTitle = title !== undefined ? title : currentCard.title;
        let targetDescription = description !== undefined ? description : currentCard.description;
        let targetPosition = position !== undefined ? position : currentCard.position;
        let targetIsBacklog = is_backlog !== undefined ? Boolean(is_backlog) : currentCard.is_backlog;
        let targetListId = list_id !== undefined ? list_id : currentCard.list_id;
        let targetBoardId = board_id !== undefined ? board_id : (currentCard.board_id || currentCard.current_board_id);
        let targetAssignedTo = assigned_to !== undefined
            ? (assigned_to ? parseInt(assigned_to) : null)
            : currentCard.assigned_to;

        if (targetIsBacklog) {
            targetListId = null;
        } else if (targetListId) {
            // Verify target list belongs to user
            const listResult = await pool.query(
                `SELECT lists.*, boards.id AS board_id
                 FROM lists
                 JOIN boards ON lists.board_id = boards.id
                 JOIN workspaces ON boards.workspace_id = workspaces.id
                 WHERE lists.id = $1
                 AND workspaces.owner_id = $2`,
                [targetListId, req.user.user_id]
            );

            if (listResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Target list does not exist or you are not authorized!'
                });
            }

            targetBoardId = listResult.rows[0].board_id;
        }

        const updatedCards = await pool.query(
            `UPDATE cards
             SET title = $1,
                 description = $2,
                 position = $3,
                 list_id = $4,
                 board_id = $5,
                 is_backlog = $6,
                 assigned_to = $7,
                 updated_at = NOW()
             WHERE id = $8
             RETURNING *`,
            [
                targetTitle,
                targetDescription,
                targetPosition,
                targetListId,
                targetBoardId,
                targetIsBacklog,
                targetAssignedTo,
                id
            ]
        );

        const card = updatedCards.rows[0];

        // Fetch assignee details
        let assigneeName = null;
        let assigneeEmail = null;
        if (card.assigned_to) {
            const userRes = await pool.query(
                `SELECT name, email FROM users WHERE user_id = $1`,
                [card.assigned_to]
            );
            if (userRes.rows.length > 0) {
                assigneeName = userRes.rows[0].name;
                assigneeEmail = userRes.rows[0].email;
            }
        }

        res.status(200).json({
            message: 'Card updated successfully!',
            card: {
                ...card,
                assigned_to_name: assigneeName,
                assigned_to_email: assigneeEmail
            }
        });

    } catch (error) {
        console.error("Error updating card:", error);
        res.status(500).json({
            error: 'An error occurred on server: ' + error.message
        });
    }
};

// Logic to assign a card to a team member
const assignCard = async (req, res) => {
    try {
        const id = req.params.id;
        const { assigned_to } = req.body;

        const cardResult = await pool.query(
            `SELECT cards.*
             FROM cards
             LEFT JOIN lists ON cards.list_id = lists.id
             LEFT JOIN boards ON (cards.board_id = boards.id OR lists.board_id = boards.id)
             JOIN workspaces ON boards.workspace_id = workspaces.id
             WHERE cards.id = $1
             AND workspaces.owner_id = $2`,
            [id, req.user.user_id]
        );

        if (cardResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Card does not exist or you are not authorized!'
            });
        }

        const newAssigneeId = assigned_to ? parseInt(assigned_to) : null;

        const updatedResult = await pool.query(
            `UPDATE cards
             SET assigned_to = $1,
                 updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [newAssigneeId, id]
        );

        const card = updatedResult.rows[0];

        let assigneeName = null;
        let assigneeEmail = null;
        if (card.assigned_to) {
            const userRes = await pool.query(
                `SELECT name, email FROM users WHERE user_id = $1`,
                [card.assigned_to]
            );
            if (userRes.rows.length > 0) {
                assigneeName = userRes.rows[0].name;
                assigneeEmail = userRes.rows[0].email;
            }
        }

        res.status(200).json({
            message: 'Card assigned successfully!',
            card: {
                ...card,
                assigned_to_name: assigneeName,
                assigned_to_email: assigneeEmail
            }
        });

    } catch (error) {
        console.error("Error assigning card:", error);
        res.status(500).json({
            error: 'An error occurred on server: ' + error.message
        });
    }
};

// Logic to delete any existing cards 
const deleteCardsId = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const cardResult = await pool.query(
            `SELECT cards.*
             FROM cards
             LEFT JOIN lists ON cards.list_id = lists.id
             LEFT JOIN boards ON (cards.board_id = boards.id OR lists.board_id = boards.id)
             JOIN workspaces ON boards.workspace_id = workspaces.id
             WHERE cards.id = $1
             AND workspaces.owner_id = $2`,
            [id, req.user.user_id]
        );

        if (cardResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Card does not exist or you are not authorized!'
            });
        }

        await pool.query('DELETE FROM cards WHERE id = $1', [id]);

        res.status(200).json({
            message: 'Card deleted successfully!'
        });

    } catch (error) {
        console.error("Error deleting card:", error);
        res.status(500).json({ error: 'An Error occurred on server!' });
    }
};

module.exports = {
    getListsCards,
    getBoardBacklog,
    getCards,
    addCards,
    updateCards,
    assignCard,
    deleteCardsId
};