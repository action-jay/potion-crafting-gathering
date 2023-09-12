const MODULE_ID = 'potion-crafting-and-gathering';

const CONSTS = {
    MODULE_ID: MODULE_ID,
    MODULE_FOLDER: `modules/${MODULE_ID}/recipes`,
    PACKS: [
        "potion-crafting-and-gathering-tables",
        "potion-crafting-and-gathering-journal"
    ]
}

//Don't need to change anything below this line

Hooks.once('init', function () {
    game.settings.register(CONSTS.MODULE_ID, 'booksImported', {
        name: "Import Content on startup",
        hint: "",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });

});

Hooks.once('ready', async function() {

    if (!game.user.isGM || !game.settings.get(CONSTS.MODULE_ID, 'booksImported')) return

    async function importAll(){
        const ROOT = CONSTS.MODULE_FOLDER;
        const BOOKS = (await FilePicker.browse("user", ROOT)).files.filter(f => f.endsWith(".json"));
        for (let book of BOOKS) {
            const bookData = await fetch(book).then(r => r.json());
            const bookObj = new ui.RecipeApp.RecipeBook(bookData);
            await bookObj.saveData();
        }
        ui.notifications.notify("Potion Crafting & Gathering - Recipe Books Imported");
        for (const pack of CONSTS.PACKS) {
            await game.packs.get(`${MODULE_ID}.${pack}`).importAll({keepId : true});
        }
        new ui.RecipeApp().render(true);
        await game.settings.set(CONSTS.MODULE_ID, 'booksImported', false);
    }

    Dialog.confirm({
        title: game.modules.get(CONSTS.MODULE_ID).title,
        content: "Do you want to import all tables, journals and recipes?",
        yes: () => {
            importAll();
        },
        no: () => {
            game.settings.set(CONSTS.MODULE_ID, 'booksImported', false);
        },
        defaultYes: true
    })

});
