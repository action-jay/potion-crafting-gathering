Hooks.once('init', function() {
    game.settings.register('potion-crafting-and-gathering', 'booksImported', {
        name: "Import Content on startup",
        hint: "",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });

});

Hooks.once('ready', async function() {

    if (!game.settings.get('potion-crafting-and-gathering', 'booksImported') || !game.user.isGM) return

    async function importAll(){
        const ROOT = "modules/potion-crafting-and-gathering/recipes";
        const BOOKS = (await FilePicker.browse("user", ROOT)).files.filter(f => f.endsWith(".json"));
        for (let book of BOOKS) {
            const bookData = await fetch(book).then(r => r.json());
            const bookObj = new ui.RecipeApp.RecipeBook(bookData);
            await bookObj.saveData();
        }
        ui.notifications.notify("Potion Crafting & Gathering - Recipe Books Imported");
        await game.packs.get("potion-crafting-and-gathering.potion-crafting-and-gathering-tables").importAll({keepId : true});
        await game.packs.get("potion-crafting-and-gathering.potion-crafting-and-gathering-journal").importAll({keepId : true});
        new ui.RecipeApp().render(true);
        await game.settings.set('potion-crafting-and-gathering', 'booksImported', false);
    }

    Dialog.confirm({
        title: "Potion Crafting & Gathering",
        content: "Do you want to import all tables, journals and recipes?",
        yes: () => {
            importAll();
        },
        no: () => {
            game.settings.set('potion-crafting-and-gathering', 'booksImported', false);
        },
        defaultYes: true
    })

});
