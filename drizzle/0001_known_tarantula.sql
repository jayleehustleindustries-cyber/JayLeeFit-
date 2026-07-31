CREATE TABLE `ai_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160),
	`goals` text NOT NULL,
	`fitnessLevel` varchar(32) NOT NULL,
	`availability` varchar(160) NOT NULL,
	`focusArea` varchar(160),
	`limitations` text,
	`planOutput` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`fullName` varchar(160),
	`phase1Json` text,
	`phase2Json` text,
	`phase3Json` text,
	`phase4Json` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`method` varchar(32) DEFAULT 'PayPal',
	`amount` decimal(10,2) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`transactionId` varchar(64) NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_reports_id` PRIMARY KEY(`id`)
);
