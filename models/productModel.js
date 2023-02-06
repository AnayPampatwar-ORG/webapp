module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define("product", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            readOnly: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        
        manufacturer: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            minimum: 0,
            maximum: 100

        },
        date_added: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            readOnly: true
        },
        date_updated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            readOnly: true
        },
        owner_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            readOnly: true
            // references: {
            //     model: 'users',
            //     key: 'id'
            // }
        }

    });
    return Product;
}
