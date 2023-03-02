module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {
        image_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        file_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        date_created: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
        s3_bucket_path: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      }, {
        tableName: 'images', // Optional: Define the table name
        timestamps: false, // Optional: Disable timestamps
      });
      

        return Image;}
      