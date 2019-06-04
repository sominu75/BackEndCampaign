const SocketIO = require('socket.io');
const schedule = require('node-schedule');
const moment = require('moment');
const GameControll = require('./GameControll');
const NetValues = require('./lib/NetValues');
const GameData = require('./GameData');

module.exports = (server, app) => {
  // const unique_name = 'time_job';
  // const scheduler = schedule.scheduleJob(unique_name, '*/1 * * * * *', function() {
  //
  //   // socket.emit('time', moment().valueOf());
  //   scheduler.cancel();
  // });
  function getCount(so) {
    let count_array = [0, 0, 0, 0];
    for (let so_name in so.adapter.nsp.sockets) {
      let client = so.adapter.nsp.sockets[so_name];
      if (client.u_info != undefined) {
        count_array[client.u_info.select_id]++;
      }
    }
    return count_array;
  }

  const io = SocketIO(server, {
    transports: ['websocket']
  });
  app.set('io', io);
  const campaign = io.of('/Campaign');
  const eventPage = io.of('/EventPage');
  campaign.on('connection', (socket) => {
    let roomID = -1;
    socket.on('room', (data) => {
      // console.log('data.room:', data);
      roomID = data.room;
      let count = 0;
      socket.join(roomID);
      if (eventPage.adapter.rooms[roomID]) {
        const room = eventPage.adapter.rooms[roomID];
        if (room) {
          // console.log('room length:', room.length);
          count = room.length;
        }

      }
      let d = {};
      d.count = count;
      d.msg = 'server hi room';
      socket.emit('room', d);
    });
    // console.log('campaign length:', campaign.server.engine.clientsCount);
    // const req = socket.request;
    // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // console.log('접속! ip:', ip);
    socket.on('msg', (data) => {
      // console.log(data.msg);
      let d = {};
      d.msg = 'server hi campaign';
      socket.emit('msg', d);
    });
    socket.on('error', (error) => {
      console.log(error);
    });
    socket.on('disconnect', () => {
      // connections.splice(connections.indexOf(socket), 1);
      // console.log('disconnect length:', connections.length);
      // const my_job = schedule.scheduledJobs[unique_name];
      // if(my_job != null){
      //   my_job.cancel();
      // }
      console.log('접속 끝!');
    });
  });
  eventPage.on('connection', (socket) => {
    console.log('eventPage length:', eventPage.server.engine.clientsCount);
    let roomID = -1;
    let countMax = -1;

    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('접속! ip:', ip);
    // console.log('req:', req);
    socket.on('room', (data) => {
      // console.log('data.room:', data);
      let count = 0;
      roomID = data.room;
      countMax = parseInt(data.countMax);

      let room = socket.adapter.rooms[roomID];
      let check_id = 0;
      if (room) {
        count = room.length;
        console.log('room name:', room);
        // console.log('room.sockets:', socket.adapter.nsp.sockets);
        for (let so_name in socket.adapter.nsp.sockets) {
          let client = socket.adapter.nsp.sockets[so_name];
          if (client.u_info != undefined) {
            if (client.u_info.nicname == data.u_info.nicname) {
              check_id = 1;
              break;
            } else if (client.u_info.email == data.u_info.email) {
              check_id = 2;
              break;
            } else if (client.u_info.phone == data.u_info.phone) {
              check_id = 3;
              break;
            }
          }
        }
      }
      let d = {};
      if (check_id == 0) {
        if (count < countMax || countMax == -1) {
          socket.join(roomID);
          room = socket.adapter.rooms[roomID];
          if (room) {
            if (room.gameControll == undefined) {
              room.gameControll = new GameControll(eventPage, socket.adapter.nsp.sockets, roomID);
            }
          }
          socket.u_info = data.u_info;
          console.log('socket.u_info.email:', socket.u_info.email);
          room = socket.adapter.rooms[roomID];
          if (room) {
            console.log('room length:', room.length);
            count = room.length;
          }
          d.count = count;
          d.msg = 'ok';
          d.check_id = check_id;
          socket.emit('room', d);
          d.msg = 'in';
          d.nicname = socket.u_info.nicname;
          socket.broadcast.to(roomID).emit('room', d);
          if (campaign.to(roomID)) {
            campaign.to(roomID).emit('room', d);
          }
        } else {
          d.count = count;
          d.check_id = check_id;
          d.msg = 'count_over';
          socket.emit('room', d);
          socket.disconnect();
        }
      } else {
        d.count = count;
        d.check_id = check_id;
        d.msg = 'repeated';
        socket.emit('room', d);
        socket.disconnect();
      }
    });

    socket.on(NetValues.CHAT, (data) => {
      let d = {};
      d.msg = 'ok';
      console.log('chat:', data);
      if (socket.u_info != undefined) {
        d.nicname = socket.u_info.nicname;
      } else {
        d.nicname = 'anonymity';
      }
      d.chat = data;
      // const room = socket.adapter.rooms[roomID];
      socket.to(roomID).emit(NetValues.CHAT, d);
    });
    socket.on(NetValues.GAME_DATA, (data) => {
      console.log('NetValues.GAME_DATA:', data);
      if (socket.u_info != undefined) {
        socket.u_info = data;
        let count_array = getCount(socket);
        eventPage.to(roomID).emit(NetValues.GAME_DATA, count_array);
      }
      // room = socket.adapter.rooms[roomID];
      // count_array[4] = room.length;

      // }
      // const room = socket.adapter.rooms[roomID];
    });
    socket.on(NetValues.GET_DATA, (data) => {
      console.log('NetValues.GET_DATA:', data);
      if (socket.u_info != undefined) {
        let room = socket.adapter.rooms[roomID];
        if (room) {
          room.gameControll.resultGame(socket);
        }
      }
    });
    socket.on('error', (error) => {
      console.log(error);
    });
    socket.on('disconnect', () => {
      const room = socket.adapter.rooms[roomID];
      console.log('disconnect room:' + room);
      socket.leave(roomID);
      if (room) {
        console.log('room length:', room.length);
        let d = {};
        d.count = room.length;
        if (socket.u_info != undefined) {
          if (socket.u_info.nicname != undefined) {
            d.nicname = socket.u_info.nicname;
          }
        }
        d.msg = 'by';
        eventPage.to(roomID).emit('room', d);
        if (campaign.to(roomID)) {
          campaign.to(roomID).emit('room', d);
        }
      } else {

        let d = {};
        d.count = 0;
        d.msg = 'by';
        if (campaign.to(roomID)) {
          campaign.to(roomID).emit('room', d);
        }
      }
      console.log('접속 끝!');
    });
  });
};
