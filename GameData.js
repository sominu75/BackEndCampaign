
class GameData {
  constructor(nicname = '', email = '', phone = '', select_id = -1) {
    this.nicname = nicname;
    this.email = email;
    this.phone = phone;
    this.select_id = select_id;
    this.life = true;
  }
}
module.exports = GameData;
