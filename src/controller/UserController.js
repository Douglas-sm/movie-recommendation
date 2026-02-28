export class UserController {
    #userService;
    #userView;
    #events;

    constructor({
        userView,
        userService,
        events,
    }) {
        this.#userView = userView;
        this.#userService = userService;
        this.#events = events;
    }

    static init(deps) {
        return new UserController(deps);
    }

    async renderUsers() {
        const users = await this.#userService.getDefaultUsers();
        this.#userView.renderUserOptions(users);
        this.setupCallbacks();

        this.#events.dispatchUsersUpdated({ users });

        if (!users.length) return;

        const defaultUser = users[0];
        this.#userView.setSelectedUser(defaultUser.id);
        this.#userView.renderUserDetails(defaultUser);
        this.#events.dispatchUserSelected(defaultUser);
    }

    setupCallbacks() {
        this.#userView.registerUserSelectCallback(this.handleUserSelect.bind(this));
    }

    async handleUserSelect(userId) {
        const user = await this.#userService.getUserById(userId);
        if (!user) return;

        this.#events.dispatchUserSelected(user);
        this.#userView.renderUserDetails(user);
    }
}
