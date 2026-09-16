import { getLibsInDependencie } from "./packageJson.js";

type LibProfile = { packages: string[]; vars: Record<string, string> };

export const libraryProfiles: LibProfile[] = [
  // --- Databases --- sql
  {
    packages: [
      "pg",
      "pg-promise",
      "@prisma/client",
      "typeorm",
      "sequelize",
      "knex",
      "postgres",
    ],
    vars: { DATABASE_URL: "postgresql://user:password@localhost:5432/dbname" },
  },
  {
    packages: ["mysql", "mysql2"],
    vars: { DATABASE_URL: "mysql://user:password@localhost:3306/dbname" },
  },
  {
    packages: ["sqlite3", "better-sqlite3"],
    vars: { DATABASE_URL: "file:./dev.db" },
  },
  {
    packages: ["mssql", "tedious"],
    vars: {
      DATABASE_URL:
        "sqlserver://localhost:1433;database=dbname;user=sa;password=password",
    },
  },
  {
    packages: ["oracledb"],
    vars: { DATABASE_URL: "oracle://user:password@localhost:1521/dbname" },
  },
  {
    packages: ["@planetscale/database"],
    vars: {
      DATABASE_HOST: "aws.connect.psdb.cloud",
      DATABASE_USERNAME: "your-username",
      DATABASE_PASSWORD: "your-password",
    },
  },
  {
    packages: ["@libsql/client"],
    vars: {
      TURSO_DATABASE_URL: "libsql://your-db.turso.io",
      TURSO_AUTH_TOKEN: "your-auth-token",
    },
  },
  {
    packages: ["@neondatabase/serverless"],
    vars: {
      DATABASE_URL:
        "postgresql://user:password@ep-example.us-east-2.aws.neon.tech/dbname",
    },
  },

  // --- NoSQL / key-value / cache ---
  {
    packages: ["mongoose", "mongodb"],
    vars: { MONGODB_URI: "mongodb://localhost:27017/dbname" },
  },
  {
    packages: ["ioredis", "redis"],
    vars: { REDIS_URL: "redis://localhost:6379" },
  },
  {
    packages: ["memcached", "memjs"],
    vars: { MEMCACHED_URL: "localhost:11211" },
  },
  {
    packages: ["cassandra-driver"],
    vars: {
      CASSANDRA_CONTACT_POINTS: "127.0.0.1",
      CASSANDRA_KEYSPACE: "your_keyspace",
    },
  },
  {
    packages: ["@supabase/supabase-js"],
    vars: {
      SUPABASE_URL: "https://your-project.supabase.co",
      SUPABASE_ANON_KEY: "your-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "your-service-role-key",
    },
  },
  {
    packages: ["firebase", "firebase-admin"],
    vars: {
      FIREBASE_PROJECT_ID: "your-project-id",
      FIREBASE_CLIENT_EMAIL: "your-client-email",
      FIREBASE_PRIVATE_KEY: "your-private-key",
    },
  },
  {
    packages: ["@upstash/redis"],
    vars: {
      UPSTASH_REDIS_REST_URL: "https://your-instance.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "your-token",
    },
  },

  // --- Auth ---
  {
    packages: ["jsonwebtoken", "jose"],
    vars: { JWT_SECRET: "your-long-random-secret" },
  },
  {
    packages: ["next-auth", "@auth/core"],
    vars: {
      NEXTAUTH_URL: "http://localhost:3000",
      NEXTAUTH_SECRET: "your-random-secret",
    },
  },
  {
    packages: ["passport", "passport-google-oauth20"],
    vars: {
      GOOGLE_CLIENT_ID: "your-client-id",
      GOOGLE_CLIENT_SECRET: "your-client-secret",
    },
  },
  {
    packages: ["auth0", "@auth0/nextjs-auth0"],
    vars: {
      AUTH0_DOMAIN: "your-tenant.auth0.com",
      AUTH0_CLIENT_ID: "your-client-id",
      AUTH0_CLIENT_SECRET: "your-client-secret",
    },
  },
  {
    packages: ["@clerk/clerk-sdk-node", "@clerk/nextjs"],
    vars: {
      CLERK_PUBLISHABLE_KEY: "pk_test_xxx",
      CLERK_SECRET_KEY: "sk_test_xxx",
    },
  },
  {
    packages: ["bcrypt", "bcryptjs"],
    vars: { BCRYPT_SALT_ROUNDS: "10" },
  },

  // --- Payments ---
  {
    packages: ["stripe"],
    vars: {
      STRIPE_SECRET_KEY: "sk_test_xxx",
      STRIPE_WEBHOOK_SECRET: "whsec_xxx",
    },
  },
  {
    packages: ["paypal-rest-sdk", "@paypal/checkout-server-sdk"],
    vars: {
      PAYPAL_CLIENT_ID: "your-client-id",
      PAYPAL_CLIENT_SECRET: "your-client-secret",
    },
  },
  {
    packages: ["mercadopago"],
    vars: { MERCADOPAGO_ACCESS_TOKEN: "your-access-token" },
  },

  // --- Email ---
  {
    packages: ["nodemailer"],
    vars: {
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: "587",
      SMTP_USER: "your-smtp-user",
      SMTP_PASSWORD: "your-smtp-password",
    },
  },
  {
    packages: ["@sendgrid/mail"],
    vars: { SENDGRID_API_KEY: "your-api-key" },
  },
  {
    packages: ["resend"],
    vars: { RESEND_API_KEY: "re_your_api_key" },
  },
  {
    packages: ["mailgun.js", "mailgun-js"],
    vars: {
      MAILGUN_API_KEY: "your-api-key",
      MAILGUN_DOMAIN: "your-domain.com",
    },
  },
  {
    packages: ["postmark"],
    vars: { POSTMARK_API_TOKEN: "your-server-token" },
  },

  // --- Messaging / SMS / push ---
  {
    packages: ["twilio"],
    vars: {
      TWILIO_ACCOUNT_SID: "your-account-sid",
      TWILIO_AUTH_TOKEN: "your-auth-token",
      TWILIO_PHONE_NUMBER: "+15555555555",
    },
  },
  {
    packages: ["@slack/web-api", "@slack/bolt"],
    vars: {
      SLACK_BOT_TOKEN: "xoxb-your-token",
      SLACK_SIGNING_SECRET: "your-signing-secret",
    },
  },
  {
    packages: ["discord.js"],
    vars: {
      DISCORD_BOT_TOKEN: "your-bot-token",
      DISCORD_CLIENT_ID: "your-client-id",
    },
  },
  {
    packages: ["node-telegram-bot-api", "telegraf"],
    vars: { TELEGRAM_BOT_TOKEN: "your-bot-token" },
  },
  {
    packages: ["web-push"],
    vars: {
      VAPID_PUBLIC_KEY: "your-public-key",
      VAPID_PRIVATE_KEY: "your-private-key",
      VAPID_SUBJECT: "mailto:you@example.com",
    },
  },

  // --- Cloud storage / CDN ---
  {
    packages: [
      "@aws-sdk/client-s3",
      "@aws-sdk/client-dynamodb",
      "@aws-sdk/client-sqs",
      "aws-sdk",
    ],
    vars: {
      AWS_ACCESS_KEY_ID: "your-access-key-id",
      AWS_SECRET_ACCESS_KEY: "your-secret-access-key",
      AWS_REGION: "us-east-1",
    },
  },
  {
    packages: ["cloudinary"],
    vars: {
      CLOUDINARY_CLOUD_NAME: "your-cloud-name",
      CLOUDINARY_API_KEY: "your-api-key",
      CLOUDINARY_API_SECRET: "your-api-secret",
    },
  },
  {
    packages: ["@google-cloud/storage"],
    vars: {
      GOOGLE_CLOUD_PROJECT_ID: "your-project-id",
      GOOGLE_APPLICATION_CREDENTIALS: "./service-account.json",
    },
  },
  {
    packages: ["@azure/storage-blob"],
    vars: {
      AZURE_STORAGE_CONNECTION_STRING:
        "DefaultEndpointsProtocol=https;AccountName=xxx;AccountKey=xxx;EndpointSuffix=core.windows.net",
    },
  },
  {
    packages: ["uploadthing", "@uploadthing/react"],
    vars: {
      UPLOADTHING_SECRET: "sk_live_xxx",
      UPLOADTHING_APP_ID: "your-app-id",
    },
  },

  // --- Search ---
  {
    packages: ["@elastic/elasticsearch"],
    vars: {
      ELASTICSEARCH_URL: "http://localhost:9200",
      ELASTICSEARCH_API_KEY: "your-api-key",
    },
  },
  {
    packages: ["algoliasearch"],
    vars: { ALGOLIA_APP_ID: "your-app-id", ALGOLIA_API_KEY: "your-api-key" },
  },
  {
    packages: ["meilisearch"],
    vars: {
      MEILISEARCH_HOST: "http://localhost:7700",
      MEILISEARCH_API_KEY: "your-master-key",
    },
  },
  {
    packages: ["typesense"],
    vars: {
      TYPESENSE_HOST: "localhost",
      TYPESENSE_PORT: "8108",
      TYPESENSE_API_KEY: "your-api-key",
    },
  },

  // --- Monitoring / logging / analytics ---
  {
    packages: ["@sentry/node", "@sentry/nextjs", "@sentry/react"],
    vars: { SENTRY_DSN: "https://examplePublicKey@o0.ingest.sentry.io/0" },
  },
  {
    packages: ["dd-trace", "datadog-metrics"],
    vars: { DD_API_KEY: "your-api-key", DD_SITE: "datadoghq.com" },
  },
  {
    packages: ["newrelic"],
    vars: {
      NEW_RELIC_LICENSE_KEY: "your-license-key",
      NEW_RELIC_APP_NAME: "your-app-name",
    },
  },
  {
    packages: ["posthog-node", "posthog-js"],
    vars: {
      POSTHOG_API_KEY: "phc_your_key",
      POSTHOG_HOST: "https://app.posthog.com",
    },
  },
  {
    packages: ["mixpanel"],
    vars: { MIXPANEL_TOKEN: "your-project-token" },
  },
  {
    packages: ["@logtail/node", "logtail"],
    vars: { LOGTAIL_SOURCE_TOKEN: "your-source-token" },
  },

  // --- AI / LLM ---
  {
    packages: ["openai"],
    vars: { OPENAI_API_KEY: "sk-your-api-key" },
  },
  {
    packages: ["@anthropic-ai/sdk"],
    vars: { ANTHROPIC_API_KEY: "sk-ant-your-api-key" },
  },
  {
    packages: ["@google/generative-ai"],
    vars: { GOOGLE_GENERATIVE_AI_API_KEY: "your-api-key" },
  },
  {
    packages: ["cohere-ai"],
    vars: { COHERE_API_KEY: "your-api-key" },
  },
  {
    packages: ["replicate"],
    vars: { REPLICATE_API_TOKEN: "your-api-token" },
  },
  {
    packages: ["@huggingface/inference"],
    vars: { HUGGINGFACE_API_KEY: "hf_your_api_key" },
  },
  {
    packages: ["langchain", "@langchain/core"],
    vars: { OPENAI_API_KEY: "sk-your-api-key" },
  },
  {
    packages: ["pinecone-client", "@pinecone-database/pinecone"],
    vars: {
      PINECONE_API_KEY: "your-api-key",
      PINECONE_ENVIRONMENT: "us-east-1-aws",
    },
  },

  // --- Maps / geo ---
  {
    packages: ["@googlemaps/google-maps-services-js"],
    vars: { GOOGLE_MAPS_API_KEY: "your-api-key" },
  },
  {
    packages: ["mapbox-gl", "@mapbox/mapbox-sdk"],
    vars: { MAPBOX_ACCESS_TOKEN: "your-access-token" },
  },

  // --- OAuth / third-party APIs ---
  {
    packages: ["@octokit/rest", "octokit"],
    vars: { GITHUB_TOKEN: "your-personal-access-token" },
  },
  {
    packages: ["googleapis"],
    vars: {
      GOOGLE_CLIENT_ID: "your-client-id",
      GOOGLE_CLIENT_SECRET: "your-client-secret",
      GOOGLE_REDIRECT_URI: "http://localhost:3000/oauth2callback",
    },
  },

  // --- Queues / message brokers ---
  {
    packages: ["amqplib"],
    vars: { RABBITMQ_URL: "amqp://guest:guest@localhost:5672" },
  },
  {
    packages: ["kafkajs"],
    vars: { KAFKA_BROKERS: "localhost:9092", KAFKA_CLIENT_ID: "your-app" },
  },
  {
    packages: ["bullmq", "bull"],
    vars: { REDIS_URL: "redis://localhost:6379" },
  },

  // --- Feature flags / misc SaaS ---
  {
    packages: ["launchdarkly-node-server-sdk"],
    vars: { LAUNCHDARKLY_SDK_KEY: "your-sdk-key" },
  },
  {
    packages: ["unleash-client"],
    vars: {
      UNLEASH_URL: "http://localhost:4242/api",
      UNLEASH_API_TOKEN: "your-api-token",
    },
  },
  {
    packages: ["recaptcha2", "react-google-recaptcha"],
    vars: {
      RECAPTCHA_SITE_KEY: "your-site-key",
      RECAPTCHA_SECRET_KEY: "your-secret-key",
    },
  },
];

export function resolveDefaults(envKey: string): string | undefined {
  for (const profile of libraryProfiles) {
    if (profile.vars[envKey]) {
      return profile.vars[envKey];
    }
  }
  return undefined;
}

export function getVarsFromLibs(libs: string[]): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const profile of libraryProfiles) {
    const isInstalled = profile.packages.some((pkg) => libs.includes(pkg));
    if (!isInstalled) continue;

    Object.assign(vars, profile.vars);
  }

  return vars;
}

export function resolveDefaultsFromLibs(envsInPackage: string[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key of envsInPackage) {
    const library = libraryProfiles.find((item) => item.packages.includes(key));
    if (!library) continue;

    Object.assign(result, library.vars);
  }

  return result;
}
