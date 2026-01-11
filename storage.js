/**
 * storage.js - Shared module for localStorage operations
 */

const STORAGE_KEYS = {
    USERS: 'todolist_users',
    CURRENT_USER: 'todolist_current_user',
    ITEMS: 'todolist_items'
};

const StorageService = {
    // --- Auth Operations ---
    
    getUsers: function() {
        const users = localStorage.getItem(STORAGE_KEYS.USERS);
        return users ? JSON.parse(users) : [];
    },

    saveUser: function(userData) {
        const users = this.getUsers();
        // Simple check for existing email
        if (users.find(u => u.email === userData.email)) {
            return { success: false, error: 'Email already registered!' };
        }
        
        const newUser = {
            id: Date.now(), // Use timestamp as simple ID
            name: userData.name,
            email: userData.email,
            password: userData.password, // In a real app, this should be hashed
            profile_image: null
        };
        
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // Auto-login after registration
        this.login(newUser.email, newUser.password);
        return { success: true };
    },

    login: function(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            return { success: true, user: user };
        }
        return { success: false, error: 'Invalid email or password!' };
    },

    getCurrentUser: function() {
        const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return user ? JSON.parse(user) : null;
    },

    updateUser: function(updatedData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return { success: false, error: 'Not logged in' };
        
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            // Update email uniquely check
            if (updatedData.email && updatedData.email !== currentUser.email) {
                if (users.find(u => u.email === updatedData.email)) {
                    return { success: false, error: 'Email already taken!' };
                }
            }
            
            users[userIndex] = { ...users[userIndex], ...updatedData };
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
            return { success: true, user: users[userIndex] };
        }
        return { success: false, error: 'User not found' };
    },

    logout: function() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },

    // --- Items (Tasks & Notes) Operations ---

    getItems: function() {
        const items = localStorage.getItem(STORAGE_KEYS.ITEMS);
        return items ? JSON.parse(items) : [];
    },

    getUserItems: function() {
        const user = this.getCurrentUser();
        if (!user) return [];
        const items = this.getItems();
        return items.filter(item => item.user_id === user.id);
    },

    saveItem: function(itemData) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, error: 'Not logged in' };
        
        const items = this.getItems();
        const newItem = {
            id: Date.now(),
            user_id: user.id,
            type: itemData.type, // 'task' or 'note'
            content: itemData.content,
            status: itemData.status || 'pending',
            created_at: new Date().toISOString()
        };
        
        items.push(newItem);
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
        return { success: true, item: newItem };
    },

    updateItem: function(itemId, updatedData) {
        const items = this.getItems();
        const itemIndex = items.findIndex(i => i.id == itemId);
        
        if (itemIndex !== -1) {
            items[itemIndex] = { ...items[itemIndex], ...updatedData };
            localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
            return { success: true, item: items[itemIndex] };
        }
        return { success: false, error: 'Item not found' };
    },

    deleteItem: function(itemId) {
        let items = this.getItems();
        items = items.filter(i => i.id != itemId);
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
        return { success: true };
    }
};

// Expose StorageService globally
window.StorageService = StorageService;
