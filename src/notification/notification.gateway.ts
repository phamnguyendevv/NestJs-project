import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Notification } from './entities/notification.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // Trong môi trường production, hãy giới hạn nguồn cụ thể
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationsGateway');

  // Map userId với socketId
  private userSockets = new Map<string, string>();

  afterInit(server: Server) {
    this.logger.log('Khởi tạo WebSocket Gateway');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string; // Nhận userId từ query params

    if (userId) {
      this.userSockets.set(userId, client.id); // Lưu userId và socketId
      client.join(userId); // Thêm client vào "room" có tên userId
      this.logger.log(`Client connected: ${client.id} (User ID: ${userId})`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.userSockets.entries()].find(
      ([_, socketId]) => socketId === client.id,
    )?.[0];
    if (userId) {
      this.userSockets.delete(userId); // Xóa user khỏi danh sách khi ngắt kết nối
      this.logger.log(`Client disconnected: ${client.id} (User ID: ${userId})`);
    }
  }

  // Phương thức để gửi thông báo mới đến tất cả client đang kết nối
  sendNotification(notification: Notification) {
    this.server.emit('notification', notification);
    this.logger.log(`Sent notification to all clients:`, notification);
  }

  // Gửi thông báo đến user cụ thể
  sendNotificationToUser(userId: string, notification: Notification) {
    const socketId = this.userSockets.get(userId); // Lấy socketId của user
    if (socketId) {
      this.server.to(socketId).emit('notification', notification, userId);
      this.logger.log(`Sent notification to userId ${userId}:`, notification);
    } else {
      this.logger.warn(`User ${userId} is not connected.`);
    }
  }
}
