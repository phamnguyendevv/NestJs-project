import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class CommentGateway {
  constructor(private readonly commentService: CommentService) {}

  @SubscribeMessage('createComment')
  create(@MessageBody() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @SubscribeMessage('findAllComment')
  findAll(@MessageBody() id: number) {
    return this.commentService.findAll(id);
  }

  @SubscribeMessage('findOneComment')
  findOne(@MessageBody() id: number) {
    return this.commentService.findOne(id);
  }

  @SubscribeMessage('updateComment')
  update(@MessageBody() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(updateCommentDto.id, updateCommentDto);
  }

  @SubscribeMessage('removeComment')
  remove(@MessageBody() id: number) {
    return this.commentService.remove(id);
  }
}
