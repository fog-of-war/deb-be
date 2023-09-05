import { ApiProperty } from "@nestjs/swagger";
export class GetOneRankResponse {  
    @ApiProperty({ description: '사용자 ID' })
    user_id: number
    @ApiProperty({ description: '사용자 포인트' })
    user_points:number
    @ApiProperty({ description: '랭킹' })
    rank: number
}

