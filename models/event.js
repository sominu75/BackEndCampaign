module.exports = (sequelize, DataTypes) => {
  return sequelize.define('event', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    admin_id: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    root_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    event_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    youtube_url: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    },
    youtube_time: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    email_content: {
      type: DataTypes.STRING(200),
      defaultValue: ''
    },
    winners_id: {
      type: DataTypes.STRING(200),
      defaultValue: ''
    },
    image_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    start_time: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    string_ease_0: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    },
    string_ease_1: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    },
    string_ease_2: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    },
    winner: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    winner_done: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    bong: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    root_view: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rang: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    number_ease_0: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    number_ease_1: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    number_ease_2: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    time: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: false
  });
};
