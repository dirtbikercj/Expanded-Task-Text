using BepInEx;
using Comfort.Common;
using EFT;
using EFT.UI;

namespace ExpandedTaskText
{
    [BepInPlugin(PluginInfo.PLUGIN_GUID, PluginInfo.PLUGIN_NAME, PluginInfo.PLUGIN_VERSION)]
    public class Plugin : BaseUnityPlugin
    {
        void Awake()
        {
            new MenuTaskBarPatch().Enable();
            new OnScreenChangedPatch().Enable();
        }
    }
}
