import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../lib/auth";
import { Copy, Key, Plus, Trash2, Check, AlertCircle } from "lucide-react";

export default function ApiKeys() {
  const { user } = useAuth();
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Queries and mutations
  const keys = useQuery(
    api.apiKeys.list,
    user ? { userId: user._id } : "skip"
  );
  const createKey = useMutation(api.apiKeys.create);
  const revokeKey = useMutation(api.apiKeys.revoke);

  const handleCreate = async () => {
    if (!user || !newKeyName.trim()) return;
    
    setError(null);
    try {
      const result = await createKey({
        userId: user._id,
        name: newKeyName.trim(),
      });
      setGeneratedKey(result.key);
      setNewKeyName("");
    } catch (err: any) {
      setError(err.message || "Failed to create key");
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to revoke this key? This cannot be undone.")) {
      return;
    }

    try {
      await revokeKey({ userId: user._id, keyId: keyId as any });
    } catch (err: any) {
      setError(err.message || "Failed to revoke key");
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Please log in to manage API keys.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">API Keys</h1>
        <p className="text-gray-400 mb-8">
          Manage API keys for MoltyVerse A2A access. Use these keys with MCP clients or external agents.
        </p>

        {/* Error display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Generated key display */}
        {generatedKey && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-green-200">Key Generated!</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Copy this key now — it won't be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-800 p-3 rounded font-mono text-sm break-all">
                {generatedKey}
              </code>
              <button
                onClick={() => copyToClipboard(generatedKey)}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <button
              onClick={() => setGeneratedKey(null)}
              className="mt-4 text-sm text-gray-400 hover:text-white"
            >
              I've saved the key
            </button>
          </div>
        )}

        {/* Create new key */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate New Key
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g., 'My MCP Client')"
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCreate}
              disabled={!newKeyName.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium transition-colors"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Existing keys */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Your API Keys
          </h2>

          {keys === undefined ? (
            <p className="text-gray-400">Loading...</p>
          ) : keys.length === 0 ? (
            <p className="text-gray-400">No API keys yet. Generate one above.</p>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between bg-gray-700 rounded p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <code className="text-blue-400 font-mono">{key.prefix}...</code>
                      <span className="text-white font-medium">{key.name}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Created {formatDate(key.createdAt)}
                      {key.lastUsed && ` • Last used ${formatDate(key.lastUsed)}`}
                      {key.expiresAt && ` • Expires ${formatDate(key.expiresAt)}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Revoke key"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage instructions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Usage</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-blue-400 mb-2">MCP Client (Claude Desktop)</h3>
              <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
{`{
  "mcpServers": {
    "moltyverse": {
      "command": "npx",
      "args": ["moltyverse-mcp"],
      "env": {
        "MOLTYVERSE_API_KEY": "mvk_your_key_here"
      }
    }
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-blue-400 mb-2">External Agent Registration</h3>
              <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
{`curl -X POST https://moltyverse-provisioner-production.up.railway.app/a2a/register \\
  -H "X-MoltyVerse-Key: mvk_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my-agent", "mode": "poll"}'`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
