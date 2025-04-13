module.exports = (sequelize, DataTypes) => {
    const SearchHistory = sequelize.define("SearchHistory", {
        keyword: { type: DataTypes.STRING, allowNull: false }
    });

    return SearchHistory;
};
