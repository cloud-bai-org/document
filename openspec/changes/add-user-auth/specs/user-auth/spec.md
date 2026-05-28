## ADDED Requirements

### Requirement: Guest mode access
The system SHALL allow users to use all core features without signing in. Records produced in guest mode SHALL be persisted on the local device.

#### Scenario: Unauthenticated user completes a ceremony
- **WHEN** an unauthenticated user completes a ceremony flow
- **THEN** the resulting record SHALL be stored on the local device
- **AND** the user SHALL NOT be required to sign in to reach the completion summary

#### Scenario: Unauthenticated user opens the app on a new session
- **WHEN** an unauthenticated user reopens the app on the same device
- **THEN** prior guest records on that device SHALL remain accessible

### Requirement: Sign-in prompt after ceremony
The system SHALL prompt the user to sign in on the ceremony completion summary, offering to bind the just-completed record to an account.

#### Scenario: Ceremony completion summary is shown to a guest
- **WHEN** the completion summary is shown to an unauthenticated user
- **THEN** the summary SHALL display a sign-in prompt offering to save the record to an account

#### Scenario: User declines the sign-in prompt
- **WHEN** an unauthenticated user dismisses the sign-in prompt
- **THEN** the user SHALL remain in guest mode
- **AND** the record SHALL remain stored on the local device

### Requirement: Manual sign-in entry point
The system SHALL provide a manual sign-in entry point reachable from the settings or profile area, independent of any ceremony flow.

#### Scenario: User chooses to sign in from settings
- **WHEN** a user opens the sign-in entry point from settings or profile
- **THEN** the system SHALL present the sign-in screen

### Requirement: Supported sign-in methods
The system SHALL support the following sign-in methods: Email + password, Google, LINE, and Facebook. Email SHALL serve as the account identifier for the Email + password method.

#### Scenario: Sign-in screen lists available methods
- **WHEN** a user reaches the sign-in screen
- **THEN** the screen SHALL offer Email + password sign-in
- **AND** the screen SHALL offer Google, LINE, and Facebook sign-in

#### Scenario: User signs in with Email and password
- **WHEN** a user submits an Email and password
- **THEN** the system SHALL authenticate the user using the submitted Email as the account identifier

#### Scenario: User signs in with a third-party provider
- **WHEN** a user selects Google, LINE, or Facebook
- **THEN** the system SHALL redirect to that provider's authorization flow
- **AND** the system SHALL complete sign-in upon successful authorization

### Requirement: Password strength policy
The system SHALL accept any password that satisfies the implementation's default password policy. No project-specific minimum length or complexity rule is mandated by this specification.

#### Scenario: User registers with an Email and password
- **WHEN** a user submits a password during registration
- **THEN** the system SHALL accept the password if it satisfies the implementation default policy

### Requirement: Bind guest records on first sign-in
The system SHALL bind existing local guest records to the account when a user signs in to a newly created account on that device.

#### Scenario: New account is created on a device with guest records
- **WHEN** a user creates a new account from a device that holds local guest records
- **THEN** those local guest records SHALL be bound to the newly created account

### Requirement: Load cloud records on existing-account sign-in
The system SHALL load the account's cloud records when a user signs in to an existing account.

#### Scenario: User signs in to an existing account
- **WHEN** a user signs in to an existing account
- **THEN** the system SHALL load that account's cloud records into the current device session

### Requirement: No guest-to-account merging
The system SHALL NOT perform automatic merging or conflict resolution between local guest records and pre-existing cloud records of an account.

#### Scenario: User signs in to an existing account from a device with guest records
- **WHEN** a user signs in to an existing account from a device that already holds local guest records
- **THEN** the system SHALL NOT automatically merge the local guest records into the account's cloud records
- **AND** the local guest records SHALL remain available on the device

### Requirement: Multi-session sign-in
The system SHALL allow a single account to be signed in concurrently on multiple devices. Signing in on a new device SHALL NOT invalidate sessions on the account's other devices.

#### Scenario: User signs in on a second device while already signed in elsewhere
- **WHEN** a user signs in to an account on a new device while another device is already signed in to the same account
- **THEN** both devices SHALL remain signed in
- **AND** the prior device's session SHALL NOT be invalidated by the new sign-in

### Requirement: Sign-out scope
The system SHALL, by default, sign out only the current device when the user invokes sign-out. The system SHALL additionally provide a "sign out all devices" action that invalidates sessions on every device signed in to the account.

#### Scenario: User signs out on one device
- **WHEN** a signed-in user invokes the default sign-out action on a device
- **THEN** the system SHALL end the session on that device only
- **AND** sessions on the account's other devices SHALL remain active

#### Scenario: User signs out from all devices
- **WHEN** a signed-in user invokes "sign out all devices"
- **THEN** the system SHALL invalidate sessions on every device currently signed in to that account

### Requirement: Failure preserves guest state
The system SHALL preserve the user's guest identity and local records when sign-in fails, is cancelled, or cannot complete due to a network failure.

#### Scenario: Third-party authorization fails or is cancelled
- **WHEN** a third-party sign-in attempt fails or is cancelled by the user
- **THEN** the user SHALL remain in guest mode
- **AND** any local records SHALL remain intact
- **AND** the system SHALL surface a message indicating the sign-in did not complete

#### Scenario: Network failure during sign-in
- **WHEN** sign-in cannot complete due to a network failure
- **THEN** the user SHALL remain in guest mode
- **AND** any local records SHALL remain intact
- **AND** the system SHALL offer the user the opportunity to retry sign-in later
