import { ApiProperty } from "@nestjs/swagger";

export class GetManyRanksResponse {
    @ApiProperty({ description: '사용자 ID' })
    user_id: number;
  
    @ApiProperty({ description: '사용자 닉네임' })
    user_nickname: string;
  
    @ApiProperty({ description: '사용자 프로필 이미지 URL' })
    user_image_url: string;
  
    @ApiProperty({ description: '사용자 포인트' })
    user_points: number;
  
    @ApiProperty({ description: '랭킹' })
    rank: number;
}