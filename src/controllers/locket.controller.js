const locketService = require("../services/locket/locket-service.js");

class LocketController {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await locketService.login(email, password);
            return res.status(200).json({ user });
        } catch (error) {
            next(error);
        }
    }

    async uploadMedia(req, res, next) {
        try {
            const { userId, idToken, caption, color_top, color_bottom, text_color, overlay_type, music_track } = req.body;
            const { images, videos } = req.files;

            if (!images && !videos) {
                return res.status(400).json({
                    message: "No media found",
                });
            }

            if (images && videos) {
                return res.status(400).json({
                    message: "Only one type of media is allowed",
                });
            }

            if (images) {
                // Parse music_track if present
                let musicData = null;
                if (music_track) {
                    try {
                        musicData = typeof music_track === 'string' ? JSON.parse(music_track) : music_track;
                    } catch (e) {
                        console.warn('Failed to parse music_track:', e);
                    }
                }
                
                const overlayOptions = {
                    caption,
                    color_top: color_top || '#000000',
                    color_bottom: color_bottom || '#000000',
                    text_color: text_color || '#FFFFFF',
                    overlay_type: overlay_type || 'default',
                    music_track: musicData
                };
                
                await locketService.postImage(
                    userId,
                    idToken,
                    images[0],
                    overlayOptions
                );
                return res.status(200).json({
                    message: "Upload image successfully",
                });
            } else {
                if (videos[0].size > 10 * 1024 * 1024) {
                    return res.status(400).json({
                        message: "Video size exceeds 10MB",
                    });
                }

                // Parse music_track if present (same as image)
                let musicData = null;
                if (music_track) {
                    try {
                        musicData = typeof music_track === 'string' ? JSON.parse(music_track) : music_track;
                    } catch (e) {
                        console.warn('Failed to parse music_track:', e);
                    }
                }
                
                const overlayOptions = {
                    caption,
                    color_top: color_top || '#000000',
                    color_bottom: color_bottom || '#000000',
                    text_color: text_color || '#FFFFFF',
                    overlay_type: overlay_type || 'default',
                    music_track: musicData
                };

                const result = await locketService.postVideo(
                    userId,
                    idToken,
                    videos[0],
                    overlayOptions
                );
                
                return res.status(200).json({
                    message: "Upload video successfully",
                    videoUrl: result.videoUrl,
                    thumbnailUrl: result.thumbnailUrl
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new LocketController();
