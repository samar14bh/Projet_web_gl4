import { Controller, Post, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { MailService } from './mail.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) { }

    @Post('contact-club')
    @UseGuards(AuthGuard('jwt'))
    async sendContactClubEmail(
        @Body() body: { to: string; subject: string; message: string },
        @Req() req,
    ) {
        const user = req.user;

        if (!user) {
            throw new UnauthorizedException('User not authenticated');
        }

        const from = user.email;

        return this.mailService.sendClubMessage(
            body.to,
            from,
            body.subject,
            body.message,
        );
    }
}
