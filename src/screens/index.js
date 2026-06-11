<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simply Supported Beam Calculator</title>

    <style>

        *{
            margin:0;
            padding:0;
            box-sizing:border-box;
            font-family:'Poppins',sans-serif;
        }

        body{
            min-height:100vh;
            display:flex;
            justify-content:center;
            align-items:center;
            background:
            linear-gradient(135deg,
            #ffb6d9,
            #ff8fc7,
            #ff69b4,
            #ff4fa3);
            overflow:hidden;
            position:relative;
        }

        /* Decorative bubbles */

        .bubble1,
        .bubble2,
        .bubble3{
            position:absolute;
            border-radius:50%;
            background:rgba(255,255,255,0.18);
        }

        .bubble1{
            width:220px;
            height:220px;
            top:-60px;
            left:-50px;
        }

        .bubble2{
            width:180px;
            height:180px;
            bottom:-40px;
            right:-30px;
        }

        .bubble3{
            width:90px;
            height:90px;
            top:50%;
            left:8%;
        }

        .container{
            width:380px;
            padding:30px;
            border-radius:30px;
            background:rgba(255,255,255,0.22);
            backdrop-filter:blur(15px);
            border:2px solid rgba(255,255,255,0.25);
            box-shadow:0 12px 35px rgba(255,20,147,0.35);
            position:relative;
            z-index:1;
        }

        h1{
            text-align:center;
            color:rgb(23, 5, 5);
            font-size:28px;
            margin-bottom:8px;
            text-shadow:0 2px 8px rgba(0,0,0,0.15);
        }

        .subtitle{
            text-align:center;
            color:#171516;
            font-size:13px;
            margin-bottom:24px;
        }

        .input-box{
            margin-bottom:16px;
        }

        .input-box label{
            display:block;
            margin-bottom:7px;
            color:rgb(13, 2, 2);
            font-size:13px;
            font-weight:bold;
        }

        .input-box input{
            width:100%;
            padding:13px;
            border:none;
            border-radius:15px;
            background:rgba(255,255,255,0.35);
            color:rgb(10, 9, 9);
            font-size:14px;
            outline:none;
            transition:0.3s;
        }

        .input-box input:focus{
            background:rgba(255,255,255,0.45);
            box-shadow:0 0 12px rgba(255,255,255,0.4);
        }

        .input-box input::placeholder{
            color:#120f10;
        }

        button{
            width:100%;
            padding:14px;
            margin-top:10px;
            border:none;
            border-radius:18px;
            background:
            linear-gradient(135deg,
            #ff1493,
            #ff4fa3);
            color:rgb(7, 7, 7);
            font-size:16px;
            font-weight:bold;
            cursor:pointer;
            transition:0.3s;
        }

        button:hover{
            transform:translateY(-2px);
            box-shadow:0 8px 20px rgba(255,20,147,0.45);
        }

        #results{
            display:none;
            margin-top:24px;
        }

        .result-card{
            background:rgba(255,255,255,0.18);
            padding:14px;
            border-radius:16px;
            margin-bottom:12px;
        }

        .result-card h3{
            color:#211f20;
            font-size:14px;
            margin-bottom:8px;
        }

        .result{
            color:rgb(18, 17, 17);
            font-size:20px;
            font-weight:bold;
        }

        .warning{
            margin-top:12px;
            background:#090808;
            color:#ff0055;
            padding:12px;
            border-radius:14px;
            text-align:center;
            font-weight:bold;
            display:none;
        }

    </style>

</head>

<body>

    <!-- Decorative Bubbles -->

    <div class="bubble1"></div>
    <div class="bubble2"></div>
    <div class="bubble3"></div>

    <div class="container">

        <h1>
             Beam Calculator
        </h1>

        <div class="subtitle">
            Simply Supported Beam Analysis Tool
        </div>

        <div class="input-box">
            <label>Load w (kN/m)</label>
            <input type="number" id="w" placeholder="Enter load">
        </div>

        <div class="input-box">
            <label>Span L (m)</label>
            <input type="number" id="L" placeholder="Enter span">
        </div>

        <div class="input-box">
            <label>Modulus E (GPa)</label>
            <input type="number" id="E" placeholder="Enter modulus">
        </div>

        <div class="input-box">
            <label>Second Moment I (m⁴)</label>
            <input type="number" id="I" placeholder="Enter moment">
        </div>

        <button onclick="calculate()">
            Calculate
        </button>

        <div id="results">

            <div class="result-card">
                <h3>💎 Maximum Bending Moment</h3>
                <div class="result" id="moment">
                    0.000 kN·m
                </div>
            </div>

            <div class="result-card">
                <h3>🌸 Maximum Shear Force</h3>
                <div class="result" id="shear">
                    0.000 kN
                </div>
            </div>

            <div class="result-card">
                <h3>✨ Mid-span Deflection</h3>
                <div class="result" id="deflection">
                    0.000 mm
                </div>
            </div>

            <div class="warning" id="warning">
                ⚠ WARNING: Deflection exceeds limit!
            </div>

        </div>

    </div>

    <script>

        function calculate(){

            const w =
            parseFloat(document.getElementById('w').value);

            const L =
            parseFloat(document.getElementById('L').value);

            const E =
            parseFloat(document.getElementById('E').value);

            const I =
            parseFloat(document.getElementById('I').value);

            if(isNaN(w) || isNaN(L) ||
               isNaN(E) || isNaN(I) ||
               w <= 0 || L <= 0 ||
               E <= 0 || I <= 0){

                alert(
                "Please enter positive numbers for all fields."
                );

                return;
            }

            const M =
            (w * L * L) / 8;

            const V =
            (w * L) / 2;

            const delta_m =
            (5 * w * Math.pow(L,4)) /
            (384 * E * I);

            const delta_mm =
            delta_m * 1000;

            document.getElementById('moment').innerHTML =
            M.toFixed(3) + " kN·m";

            document.getElementById('shear').innerHTML =
            V.toFixed(3) + " kN";

            document.getElementById('deflection').innerHTML =
            delta_mm.toFixed(3) + " mm";

            document.getElementById('results').style.display =
            'block';

            const warning =
            document.getElementById('warning');

            if(delta_m > L / 300){

                warning.style.display = 'block';

            }else{

                warning.style.display = 'none';

            }

        }

    </script>

</body>

</html>
