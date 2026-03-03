import { api } from '../../lib/api.ts';

export async function displayMembers() {
    const userList = document.getElementById('user-list');
    if(!userList) return;

    try {
        const allUsers = await api.getAllUsers();

        // delete old
        userList.innerHTML = "";

        if(!allUsers || allUsers.length === 0){
            userList.innerHTML = "<li>No members found. Very sad. Anyway</li>";
            return;
        }

        allUsers.forEach(user => {
            const li = document.createElement("li");
            li.className = "member-item";

            const name = user.display_name || user.username || user.handle || "Anonymous";
            li.innerHTML = `<strong>${name}</strong>`;

            userList.appendChild(li);
        });
    } catch (error) {
        console.error("Fehler beim Laden der Member:", error);
        userList.innerHTML = "<li>Error loading members.</li>";
    }
}

displayMembers();