#!/usr/bin/env node
require('dotenv').config();

const path = require('path');
const readline = require('readline');

// Conectar a la base de datos usando la configuración existente
require(path.join(__dirname, '..', 'config', 'db.config'));

const Photo = require(path.join(__dirname, '..', 'models', 'photo.model'));
const cloudinary = require('cloudinary').v2;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const yesAll = args.includes('--yes') || args.includes('-y');
const onlyCloudinary = args.includes('--only-cloudinary') || args.includes('--folder-delete');

const getPublicIdFromUrl = (photoUrl) => {
  try {
    if (!photoUrl) return null;
    const decodedUrl = decodeURIComponent(photoUrl);
    const urlParts = decodedUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return null;
    let pathWithFile = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathWithFile.replace(/\.[^/.]+$/, '');
    return publicId;
  } catch (err) {
    return null;
  }
};

const promptYesNo = (question) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes' || answer.trim().toLowerCase() === 'y');
    });
  });
};

async function main() {
  // Ensure cloudinary is configured from env if not already
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  // If requested, delete by folder prefix directly in Cloudinary
  if (onlyCloudinary) {
    const prefix = 'la-vin-nails-web/uñas-clientas';
    console.log('Target Cloudinary prefix:', prefix);
    if (dryRun) {
      console.log('[dry-run] Would delete all resources by prefix:', prefix);
      process.exit(0);
    }
    if (!yesAll) {
      const proceed = await promptYesNo('\nThis will delete ALL images in Cloudinary folder "la-vin-nails-web/uñas-clientas". Type yes to proceed: ');
      if (!proceed) {
        console.log('Aborting Cloudinary folder deletion.');
        process.exit(0);
      }
    }
    try {
      // paginate delete_resources_by_prefix until Cloudinary reports partial: false
      let nextCursor = undefined;
      let totalDeleted = 0;
      do {
        const opts = { resource_type: 'image' };
        if (nextCursor) opts.next_cursor = nextCursor;
        const resp = await cloudinary.api.delete_resources_by_prefix(prefix, opts);
        console.log('Cloudinary batch response:', { deleted_count: Object.keys(resp || {}).length, partial: resp && resp.partial });
        if (resp && resp.deleted) {
          totalDeleted += Object.keys(resp.deleted).length;
        }
        nextCursor = resp && resp.next_cursor;
        // small delay to avoid hitting rate limits aggressively
        if (resp && resp.partial && nextCursor) await new Promise(r => setTimeout(r, 500));
      } while (nextCursor);

      console.log('Total deleted (approx):', totalDeleted);

      try {
        const folderResp = await cloudinary.api.delete_folder(prefix);
        console.log('Cloudinary delete_folder response:', folderResp);
      } catch (fErr) {
        console.warn('Could not delete folder (may be non-empty or not supported):', fErr.message || fErr);
      }

      process.exit(0);
    } catch (err) {
      console.error('Error deleting Cloudinary folder prefix:', err);
      process.exit(2);
    }
  }
  try {
    const photos = await Photo.find().lean().exec();
    const total = photos.length;

    console.log(`Found ${total} photos in the database.`);
    if (total === 0) {
      process.exit(0);
    }

    if (!yesAll) {
      console.log('Sample URLs:');
      photos.slice(0, 5).forEach((p, i) => console.log(`${i + 1}. ${p.photoUrl}`));
      if (dryRun) {
        console.log('\nRunning in dry-run mode: no changes will be made.');
      }
      const proceed = await promptYesNo('\nDo you want to continue? Type yes to proceed: ');
      if (!proceed) {
        console.log('Aborting. No changes made.');
        process.exit(0);
      }
    } else {
      if (dryRun) console.log('Running with --yes and --dry-run (no destructive actions).');
      else console.log('Running with --yes (will perform destructive actions).');
    }

    let cloudDeleted = 0;
    let dbDeleted = 0;
    let cloudNotFound = 0;
    let cloudErrors = 0;

    for (const photo of photos) {
      const publicId = getPublicIdFromUrl(photo.photoUrl);
      if (!publicId) {
        console.warn('Could not extract public_id from URL:', photo.photoUrl);
      } else {
        console.log(`Processing public_id: ${publicId}`);
        if (!dryRun) {
          try {
            const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            if (result && result.result === 'ok') {
              cloudDeleted++;
              console.log('Deleted from Cloudinary:', publicId);
            } else if (result && result.result === 'not found') {
              cloudNotFound++;
              console.warn('Not found on Cloudinary:', publicId);
            } else {
              cloudErrors++;
              console.warn('Unexpected Cloudinary result for', publicId, result);
            }
          } catch (err) {
            cloudErrors++;
            console.error('Error deleting from Cloudinary for', publicId, err.message || err);
          }
        } else {
          console.log('[dry-run] Would delete from Cloudinary:', publicId);
        }
      }

      if (!dryRun) {
        try {
          const r = await Photo.deleteOne({ _id: photo._id });
          if (r.deletedCount && r.deletedCount > 0) {
            dbDeleted++;
          }
        } catch (err) {
          console.error('Error deleting DB record for', photo._id, err.message || err);
        }
      } else {
        console.log('[dry-run] Would delete DB record for', photo._id);
      }
    }

    console.log('\nSummary:');
    console.log(`Total photos processed: ${total}`);
    console.log(`Cloudinary deleted: ${cloudDeleted}`);
    console.log(`Cloudinary not found: ${cloudNotFound}`);
    console.log(`Cloudinary errors: ${cloudErrors}`);
    console.log(`DB deleted: ${dbDeleted}`);

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(2);
  }
}

main();
