import { reddit } from '@devvit/web/server';

export const createPost = async () => {
  return await reddit.submitCustomPost({
    title: 'Cat Burglary — sneak in, grab treats, dodge the slipper!',
  });
};
