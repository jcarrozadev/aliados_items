local QBCore = exports['qb-core']:GetCoreObject()

RegisterCommand('items', function(src, args, raw)
    if not IsPlayerAceAllowed(src, 'command.items') then
        TriggerClientEvent('QBCore:Notify', src, 'No tienes permisos para usar este comando.', 'error')
        return
    end
    TriggerClientEvent('aliados_items:open', src)
end, true)

-- Callback para devolver la tabla de items completa
QBCore.Functions.CreateCallback('aliados_items:getItems', function(source, cb)
    cb(QBCore.Shared.Items)
end)
