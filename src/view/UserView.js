import { View } from './View.js';
import { I18n } from '../i18n/i18n.js';

export class UserView extends View {
    #userSelect = document.querySelector('#userSelect');
    #userAge = document.querySelector('#userAge');
    #userGender = document.querySelector('#userGender');
    #favoriteGenresList = document.querySelector('#favoriteGenresList');
    #hobbiesList = document.querySelector('#hobbiesList');
    #userDescription = document.querySelector('#userDescription');

    #onUserSelect;
    #users = [];
    #currentUser = null;

    constructor() {
        super();
        this.attachUserSelectListener();
        I18n.onChange(() => this.#rerenderLanguage());
    }

    registerUserSelectCallback(callback) {
        this.#onUserSelect = callback;
    }

    renderUserOptions(users = []) {
        this.#users = users;

        const selectedValue = this.#userSelect.value;
        const options = users
            .map(user => `<option value="${user.id}">${user.name} (#${user.id})</option>`)
            .join('');

        this.#userSelect.innerHTML = `<option value="">${I18n.t('form.selectPlaceholder')}</option>${options}`;

        if (selectedValue) {
            this.#userSelect.value = selectedValue;
        }
    }

    setSelectedUser(userId) {
        this.#userSelect.value = String(userId);
    }

    renderUserDetails(user) {
        this.#currentUser = user;

        this.#userAge.value = user.age ?? '';
        this.#userGender.value = I18n.translateUserValue(user.gender ?? '');
        this.#favoriteGenresList.innerHTML = this.#renderTags(
            (user.favorite_genres || []).map(item => I18n.translateUserValue(item)),
            'text-bg-primary'
        );
        this.#hobbiesList.innerHTML = this.#renderTags(
            (user.hobbies || []).map(item => I18n.translateUserValue(item)),
            'text-bg-secondary'
        );
        this.#userDescription.textContent = I18n.translateUserValue(user.description || '');
    }

    clearUserDetails() {
        this.#currentUser = null;
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
            }

            if (this.#onUserSelect) {
                this.#onUserSelect(userId);
            }
        });
    }

    #renderTags(items, badgeClass) {
        if (!items.length) {
            return `<span class="text-muted small">${I18n.t('misc.noData')}</span>`;
        }

        return items
            .map(item => `<span class="badge ${badgeClass}">${item}</span>`)
            .join('');
    }

    #rerenderLanguage() {
        this.renderUserOptions(this.#users);
        if (this.#currentUser) {
            this.renderUserDetails(this.#currentUser);
        }
    }
}
