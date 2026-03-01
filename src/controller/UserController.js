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
        this.#userView.clearUserDetails();

        this.#events.dispatchUsersUpdated({ users });
    }

    setupCallbacks() {
        this.#userView.registerUserSelectCallback(this.handleUserSelect.bind(this));
    }

    async handleUserSelect(userId) {
        if (!userId) {
            this.#events.dispatchUserSelected(null);
            return;
        }

        const user = await this.#userService.getUserById(userId);
        if (!user) return;

        this.#events.dispatchUserSelected(user);
        this.#userView.renderUserDetails(user);
    }
}
