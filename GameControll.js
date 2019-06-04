const axios = require('axios');
const NetValues = require('./lib/NetValues');
const schedule = require('node-schedule');
const moment = require('moment');
const GameData = require('./GameData');
class GameControll {
  constructor(eventPage, sockets, roomID) {
    this.eventPage = eventPage;
    this.sockets = sockets;
    this.roomID = roomID;
    this.all_event = null;
    this.timer_id = -1;
    this.event_count = 0;
    this.scheduler = null;
    this.count_time = 0;
    let room = this.eventPage.adapter.rooms[this.roomID];
    if (room) {
      console.log('room.lenght:', room.length);
    }
    console.log('GameControll start in');

    let data = {};
    data.campaign_id = this.roomID;
    axios.post('http://localhost:3001/api/getCampaign', data)
      .then((response) => {
        console.log('qery:', response.data);
        if (this.isRoom()) {
          if (response.data.res == NetValues.REQ_OK) {
            let event_data = this.getFristEvent(response.data.qery[0]);
            this.all_event = event_data[1];
            console.log('this.all_event:', this.all_event);
            let _this = this;
            // let sen = parseInt(response.data.qery[0].time) - parseInt(moment().valueOf());
            let sen = parseInt(response.data.qery[0].time);
            let start_time = '*/' + moment.duration(sen).seconds();
            start_time += ' ' + moment.duration(sen).minutes();
            start_time += ' ' + moment.duration(sen).hours();
            start_time += ' * * *';
            const unique_name = 'time_job';
            let rule = new schedule.RecurrenceRule();
            rule.second = moment(sen).seconds();
            rule.minute = moment(sen).minutes();
            rule.hour = moment(sen).hours();
            this.scheduler = schedule.scheduleJob(rule, function() {
              _this.timer_id = setTimeout(function() {
                _this.eventStart();
              }, 5000);
              // socket.emit('time', moment().valueOf());
              _this.scheduler.cancel();
              _this.scheduler = null;
            });
          } else {
            // this.msgRouter(response.data.res);
          }
        }
      })
      .catch(function(error) {
        console.log('error', error);
      });
    // console.log("this.sockets:" + Object.keys(_this.sockets).length);
  }
  eventStart() {
    console.log('event start');
    if (this.isRoom()) {
      let now_event = this.all_event[this.event_count];
      if (now_event.youtube_url != '') {
        let data = {};
        data.youtube_time = now_event.youtube_time;
        data.youtube_url = now_event.youtube_url;
        data.msg = this.YOUTUBE_START;
        this.eventPage.in(this.roomID).emit(NetValues.EVENT_DATA, data);
        let _this = this;
        this.timer_id = setTimeout(function() {
          _this.youtubeStop();
          _this.startDelay();
        }, parseInt(now_event.youtube_time) * 1000);
      } else {
        this.startDelay();
      }
    }
  }
  startDelay(restart = false) {
    let data = {};
    if (this.event_count < this.all_event.length) {
      let now_event = this.all_event[this.event_count];
      data.restart = restart;
      data.event_count = this.event_count;
      data.count_time = parseInt(now_event.start_time);
      this.count_time = data.count_time;
      data.msg = this.START_DELAY;
      this.eventPage.in(this.roomID).emit(NetValues.EVENT_DATA, data);
      let _this = this;
      this.timer_id = setTimeout(function() {
        _this.gameStart();
      }, 3000);
    } else {
      data.msg = this.GAME_DONE;
      this.eventPage.in(this.roomID).emit(NetValues.EVENT_DATA, data);
    }
  }
  gameStart() {
    let data = {};
    data.msg = this.EVENT_START;
    this.eventPage.in(this.roomID).emit(NetValues.EVENT_DATA, data);
    this.countDown();
  }
  countDown() {
    if (this.isRoom()) {
      let _this = this;
      let data = {};
      if (this.count_time > 0) {
        this.timer_id = setTimeout(function() {
          _this.count_time--;
          data.count_time = _this.count_time;
          data.msg = _this.COUNTDOWN;
          _this.eventPage.in(_this.roomID).emit(NetValues.EVENT_DATA, data);
          _this.countDown();
        }, 1000);
      } else {
        data.msg = this.EVENT_STOP;
        this.eventPage.in(this.roomID).emit(NetValues.EVENT_DATA, data);
          this.timer_id = setTimeout(function() {
            _this.check();
          }, 3000);
      }
    }
  }
  getCount() {
    let count_array = [0, 0, 0, 0];
    for (let so_name in this.sockets) {
      let client = this.sockets[so_name];
      if (client.u_info != undefined) {
        if(client.u_info.life){
          count_array[client.u_info.select_id]++;
        }
      }
    }
    return count_array;
  }
  check() {
    let select_array = this.getCount();
    let winner = this.getWinner();
    let index = -1;
    if (select_array[3] <= winner && select_array[3] != 0) {
      index = 3;
    } else {
      let count = 0;
      for (let i = 0; i < 3; ++i) {
        if (select_array[i] != 0) {
          count++;
        }
      }
      if (count != 3) {
        if (select_array[0] != 0 && select_array[1] != 0) {
          index = 1;
        } else if (select_array[0] != 0 && select_array[2] != 0) {
          index = 0;
        } else if (select_array[1] != 0 && select_array[2] != 0) {
          index = 2;
        }
      }
    }
    if (index != -1) {
      let email = [];
      for (let so_name in this.sockets) {
        let client = this.sockets[so_name];
        if (client.u_info != undefined) {
          if (client.u_info.select_id == index) {
            if(client.u_info.life){

            }
            client.u_info.life = false;
            email.push(client.u_info.email);
          }
        }
      }
      this.setWinner(email);
    } else {
      this.computer();
    }
  }
  setWinner(email) {
    if (email.length > 0) {
      let data = {};
      let now_event = this.all_event[this.event_count];
      let before_email = null;
      if (now_event.winners_id != '') {
        before_email = now_event.winners_id.split(',');
      }
      console.log('before_email:', before_email);
      data.id = now_event.id;
      data.email = email.join(',');
      if (before_email != null) {
        if (before_email.length > 0) {
          data.email = now_event.winners_id + ',' + data.email;
        }
      }
      console.log('data.email:', data.email);
      axios.post('http://localhost:3001/api/setWinner', data)
        .then((response) => {
          console.log('qery:', response.data);
          if (this.isRoom()) {
            if (response.data.res == NetValues.REQ_OK) {
              // response.data.qery[0]
              now_event.winner_done = parseInt(response.data.qery[0].winner_done);
              now_event.winners_id = response.data.qery[0].winners_id;

              this.all_event[this.event_count] = now_event;
              this.computer();
            } else {
              // this.msgRouter(response.data.res);
            }
          }
        })
        .catch(function(error) {
          console.log('error', error);
        });
    } else {
      this.computer();
    }
  }
  getWinner() {
    let now_event = this.all_event[this.event_count];
    let winner = parseInt(now_event.winner) - parseInt(now_event.winner_done);
    return winner;
  }
  computer() {
    let _this = this;
    this.timer_id = setTimeout(function() {
      if (_this.isRoom()) {
        let data = {};
        data.msg = _this.EVENT_COMPUTER_DONE;
        _this.eventPage.in(_this.roomID).emit(NetValues.EVENT_DATA, data);
        _this.nextGame();
      }
    }, 3000);
  }
  nextGame() {
    if (this.isRoom()) {
      let _this = this;
      this.timer_id = setTimeout(function() {
        if (_this.getWinner() > 0) {
          _this.startDelay();
        } else {
          _this.event_count++;
          _this.startDelay(true);
        }
      }, 7000);
    }
  }
  getData() {
    let winner = this.getWinner();
    let data = {};
    if (winner <= 0) {
      this.event_count++;
    }
    data.event_count = this.event_count;
    return data;
  }
  resultGame(socket) {
    let data = {};
    let now_event = this.all_event[this.event_count];
    data.winner_done = parseInt(now_event.winner_done);
    data.u_info = socket.u_info;
    socket.emit(NetValues.GET_DATA, data);
  }
  youtubeStop() {
    let data = {};
    data.msg = this.YOUTUBE_STOP;
    this.eventPage.in(this.roomID).emit(NetValues.EVENT_DATA, data);
  }
  isRoom() {
    let room = this.eventPage.adapter.rooms[this.roomID];
    if (room) {
      return true;
    } else {
      this.delect();
      return false;
    }
  }
  get allEvent() {
    return this.all_event;
  }
  getFristEvent(v) {
    let event = null;
    let new_event = [];
    console.log('v.events.length:', v.events.length);
    for (let i = 0; i < v.events.length; ++i) {
      if (parseInt(v.events[i].root_view) == 1) {
        event = v.events[i];
        new_event = v.events.splice(i, 1);
        break;
      }
    }

    v.events.unshift(new_event[0]);
    return [event, v.events];
  }
  get EVENT_START() {
    return 'eventStart';
  }
  get START_DELAY() {
    return 'startDelay'
  }
  get EVENT_STOP() {
    return 'eventStop';
  }
  get COUNTDOWN() {
    return 'countdown';
  }
  get YOUTUBE_START() {
    return 'youtubeStaet';
  }
  get YOUTUBE_STOP() {
    return 'youtubeStop';
  }
  get GAME_DONE() {
    return 'gameDone';
  }
  get EVENT_COMPUTER_DONE() {
    return 'event_computer_done';
  }
  delect() {
    console.log('delect');
    clearTimeout(this.timer_id);
    if (this.scheduler != null) {
      this.scheduler.cancel();
      this.scheduler = null;
    }
  }

}
module.exports = GameControll;
