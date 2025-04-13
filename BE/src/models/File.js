module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define("File", {
        fileUrl: { type: DataTypes.STRING, allowNull: false },
        fileName: { type: DataTypes.STRING },
        fileType: { type: DataTypes.STRING },
        fileSize: { type: DataTypes.INTEGER }
    });

    return File;
};
