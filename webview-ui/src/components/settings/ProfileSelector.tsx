import React from 'react';
import { VSCodeButton, VSCodeDropdown, VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import { useExtensionState } from '../../context/ExtensionStateContext';
import { vscode } from '../../utilities/vscode';

const ProfileSelector: React.FC = () => {
    const { profiles, currentProfileId } = useExtensionState();
    const [newProfileName, setNewProfileName] = React.useState('');
    const [showNewProfile, setShowNewProfile] = React.useState(false);

    const handleProfileChange = (event: any) => {
        const profileId = event.target.value;
        vscode.postMessage({
            type: 'switchProfile',
            profileId
        });
    };

    const handleCreateProfile = () => {
        if (newProfileName.trim()) {
            const profileId = newProfileName.toLowerCase().replace(/\s+/g, '-');
            vscode.postMessage({
                type: 'createProfile',
                profileId,
                profileName: newProfileName
            });
            setNewProfileName('');
            setShowNewProfile(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <VSCodeDropdown
                    style={{ flexGrow: 1 }}
                    value={currentProfileId}
                    onChange={handleProfileChange}
                >
                    {profiles?.map(profile => (
                        <option key={profile.id} value={profile.id}>
                            {profile.name}
                        </option>
                    ))}
                </VSCodeDropdown>
                <VSCodeButton onClick={() => setShowNewProfile(true)}>
                    New Profile
                </VSCodeButton>
            </div>

            {showNewProfile && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <VSCodeTextField
                        style={{ flexGrow: 1 }}
                        placeholder="Profile Name"
                        value={newProfileName}
                        onChange={(e: any) => setNewProfileName(e.target.value)}
                    />
                    <VSCodeButton onClick={handleCreateProfile}>
                        Create
                    </VSCodeButton>
                    <VSCodeButton onClick={() => setShowNewProfile(false)}>
                        Cancel
                    </VSCodeButton>
                </div>
            )}
        </div>
    );
};

export default ProfileSelector;
