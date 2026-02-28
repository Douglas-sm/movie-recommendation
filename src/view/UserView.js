import { View } from './View.js';

export class UserView extends View {
    #userSelect = document.querySelector('#userSelect');
    #userAge = document.querySelector('#userAge');
    #userGender = document.querySelector('#userGender');
    #favoriteGenresList = document.querySelector('#favoriteGenresList');
    #hobbiesList = document.querySelector('#hobbiesList');
    #userDescription = document.querySelector('#userDescription');

    #onUserSelect;

    constructor() {
        super();
        this.attachUserSelectListener();
    }

    registerUserSelectCallback(callback) {
        this.#onUserSelect = callback;
    }

    renderUserOptions(users) {
        const options = users
            .map(user => `<option value="${user.id}">${user.name} (#${user.id})</option>`)
            .join('');

        this.#userSelect.innerHTML = '<option value="">-- Selecione --</option>' + options;
    }

    setSelectedUser(userId) {
        this.#userSelect.value = String(userId);
    }

    renderUserDetails(user) {
        this.#userAge.value = user.age ?? '';
        this.#userGender.value = user.gender ?? '';
        this.#favoriteGenresList.innerHTML = this.#renderTags(
            user.favorite_genres || [],
            'text-bg-primary'
        );
        this.#hobbiesList.innerHTML = this.#renderTags(
            user.hobbies || [],
            'text-bg-secondary'
        );
        this.#userDescription.textContent = user.description || '';
    }

    clearUserDetails() {
        this.#userAge.value = '';
        this.#userGender.value = '';
        this.#favoriteGenresList.innerHTML = '';
        this.#hobbiesList.innerHTML = '';
        this.#userDescription.textContent = '';
    }

    attachUserSelectListener() {
        this.#userSelect.addEventListener('change', event => {
            const userId = event.target.value ? Number(event.target.value) : null;

            if (!userId) {
                this.clearUserDetails();
                return;
            }

            if (this.#onUserSelect) {
                this.#onUserSelect(userId);
            }
        });
    }

    #renderTags(items, badgeClass) {
        if (!items.length) {
            return '<span class="text-muted small">Sem dados</span>';
        }

        return items
            .map(item => `<span class="badge ${badgeClass}">${item}</span>`)
            .join('');
    }
}
