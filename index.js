const { syncDB } = require('./models');

(async () => {
    await syncDB();
})();
