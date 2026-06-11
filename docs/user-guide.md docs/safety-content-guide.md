% Button pushed function: CalculateButton
function CalculateButtonPushed(app, event)
    try
        % --- 1. INPUT VALIDATION ---
        P = app.PowerEditField.Value;     % Power in kW
        V = app.VoltageEditField.Value;   % Voltage in V
        L = app.LengthEditField.Value;    % Length in meters
        pf = str2double(app.PFDropDown.Value); % Power Factor
        
        if P <= 0 || V <= 0 || L <= 0
            uialert(app.UIFigure, 'Please enter positive physical values for Power, Voltage, and Length.', 'Input Error');
            return;
        end
        
        % --- 2. CALCULATION 1: Full Load Current (Amps) ---
        % Formula: I = (P * 1000) / (sqrt(3) * V * pf * efficiency)
        % Assuming a standard motor efficiency of 90% (0.9)
        I = (P * 1000) / (sqrt(3) * V * pf * 0.9);
        app.CurrentOutputField.Value = round(I, 2);
        
        % --- 3. CALCULATION 2: Minimum Cable Size (mm²) ---
        % Empirical electrical safety standard sizing thumb-rule: ~4 Amps per mm²
        cable_area = I / 4;
        if cable_area < 1.5
            cable_area = 1.5; % Minimum standard domestic/industrial cable size
        end
        app.CableAreaOutputField.Value = round(cable_area, 2);
        
        % --- 4. CALCULATION 3: Voltage Drop (V) ---
        % Copper resistivity standard = 0.0172 Ohms*mm²/m
        R_cable = (0.0172 * L) / cable_area;
        V_drop = sqrt(3) * I * R_cable * pf;
        app.VoltDropOutputField.Value = round(V_drop, 2);
        
        % --- 5. VISUALIZATION (Plotting Voltage Drop over Distance) ---
        distances = 1:1:max(100, L + 50);
        v_drop_curve = sqrt(3) * I * ((0.0172 * distances) / cable_area) * pf;
        
        plot(app.UIAxes, distances, v_drop_curve, 'LineWidth', 2, 'Color', [0.85 0.33 0.1]);
        hold(app.UIAxes, 'on');
        plot(app.UIAxes, L, V_drop, 'bo', 'MarkerSize', 10, 'MarkerFaceColor', 'b');
        hold(app.UIAxes, 'off');
        
        title(app.UIAxes, 'Voltage Drop Progression Over Distance');
        xlabel(app.UIAxes, 'Cable Run Length (Meters)');
        ylabel(app.UIAxes, 'Voltage Drop (Volts)');
        grid(app.UIAxes, 'on');
        
    catch
        uialert(app.UIFigure, 'An unexpected error occurred during computation.', 'Calculation Error');
    end
end
